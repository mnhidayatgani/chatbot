/**
 * Unit Tests for LogRotationManager
 * Tests log rotation and retention functionality
 */

const logRotationManager = require('../../../lib/logRotationManager');
const { LogRotationManager } = require('../../../lib/logRotationManager');
const fs = require('fs');

// Mock fs and timers
jest.mock('fs');
jest.useFakeTimers();

describe('LogRotationManager', () => {
  let manager;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    const now = new Date();
    // Mock fs functions
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.readdirSync = jest.fn().mockReturnValue([]);
    fs.statSync = jest.fn().mockReturnValue({
      isFile: () => true,
      mtime: now,
      mtimeMs: now.getTime(),
      size: 1024
    });
    fs.unlinkSync = jest.fn();

    manager = new LogRotationManager();
  });

  afterEach(() => {
    if (manager) {
      manager.stop();
    }
  });

  describe('Constructor', () => {
    test('should initialize with default retention days', () => {
      expect(manager.retentionDays).toBe(7);
    });

    test('should initialize logs directory', () => {
      expect(manager.logsDir).toBeDefined();
      expect(manager.logsDir).toContain('logs');
    });

    test('should read retention days from environment', () => {
      process.env.LOG_RETENTION_DAYS = '14';
      const customManager = new LogRotationManager();
      
      expect(customManager.retentionDays).toBe(14);
      
      delete process.env.LOG_RETENTION_DAYS;
    });

    test('should initialize intervals as null', () => {
      expect(manager.rotationInterval).toBeNull();
      expect(manager.initialTimeout).toBeNull();
    });
  });

  describe('start()', () => {
    test('should start log rotation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      manager.start();

      expect(consoleSpy).toHaveBeenCalled();
      expect(manager.initialTimeout).not.toBeNull();

      consoleSpy.mockRestore();
    });

    test('should call rotateOldLogs immediately', () => {
      const rotateSpy = jest.spyOn(manager, 'rotateOldLogs').mockImplementation();

      manager.start();

      expect(rotateSpy).toHaveBeenCalled();

      rotateSpy.mockRestore();
    });

    test('should schedule midnight rotation', () => {
      manager.start();

      expect(manager.initialTimeout).not.toBeNull();
    });

    test('should log rotation status', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      manager.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Log rotation')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('stop()', () => {
    test('should stop log rotation', () => {
      manager.start();
      manager.stop();

      expect(manager.initialTimeout).toBeNull();
      expect(manager.rotationInterval).toBeNull();
    });

    test('should clear timeout if exists', () => {
      manager.start();

      manager.stop();

      expect(manager.initialTimeout).toBeNull();
    });

    test('should clear interval if exists', () => {
      manager.start();
      manager.rotationInterval = setInterval(() => {}, 1000);

      manager.stop();

      expect(manager.rotationInterval).toBeNull();
    });

    test('should log stop message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      manager.start();
      manager.rotationInterval = setInterval(() => {}, 1000); // Simulate active interval
      manager.stop();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('stopped')
      );

      consoleSpy.mockRestore();
    });

    test('should handle stop when not started', () => {
      expect(() => manager.stop()).not.toThrow();
    });
  });

  describe('rotateOldLogs()', () => {
    test('should delete old log files', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old

      fs.readdirSync.mockReturnValue(['old-log.log']);
      fs.statSync.mockReturnValue({
        isFile: () => true,
        mtime: oldDate,
        mtimeMs: oldDate.getTime(),
        size: 1024
      });

      manager.rotateOldLogs();

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    test('should keep recent log files', () => {
      const recentDate = new Date();

      fs.readdirSync.mockReturnValue(['recent-log.log']);
      fs.statSync.mockReturnValue({
        isFile: () => true,
        mtime: recentDate,
        mtimeMs: recentDate.getTime(),
        size: 1024
      });

      manager.rotateOldLogs();

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    test('should skip directories', () => {
      fs.readdirSync.mockReturnValue(['some-directory']);
      fs.statSync.mockReturnValue({
        isFile: () => false,
        mtime: new Date(),
        size: 0
      });

      manager.rotateOldLogs();

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    test('should handle non-existent logs directory', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => manager.rotateOldLogs()).not.toThrow();
    });

    test('should handle empty logs directory', () => {
      fs.readdirSync.mockReturnValue([]);

      expect(() => manager.rotateOldLogs()).not.toThrow();
    });

    test('should handle file system errors gracefully', () => {
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      expect(() => manager.rotateOldLogs()).not.toThrow();
    });

    test('should delete multiple old files', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30);

      fs.readdirSync.mockReturnValue(['log1.log', 'log2.log', 'log3.log']);
      fs.statSync.mockReturnValue({
        isFile: () => true,
        mtime: oldDate,
        mtimeMs: oldDate.getTime(),
        size: 1024
      });

      manager.rotateOldLogs();

      expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
    });

    test('should use retention days setting', () => {
      manager.retentionDays = 3;
      
      const dateJustOld = new Date();
      dateJustOld.setDate(dateJustOld.getDate() - 4); // Just over retention

      fs.readdirSync.mockReturnValue(['log.log']);
      fs.statSync.mockReturnValue({
        isFile: () => true,
        mtime: dateJustOld,
        mtimeMs: dateJustOld.getTime(),
        size: 1024
      });

      manager.rotateOldLogs();

      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very old files', () => {
      const veryOldDate = new Date('2020-01-01');

      fs.readdirSync.mockReturnValue(['ancient-log.log']);
      fs.statSync.mockReturnValue({
        isFile: () => true,
        mtime: veryOldDate,
        mtimeMs: veryOldDate.getTime(),
        size: 1024
      });

      manager.rotateOldLogs();

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    test('should handle files with special characters', () => {
      fs.readdirSync.mockReturnValue(['log-file@#$.log']);
      
      expect(() => manager.rotateOldLogs()).not.toThrow();
    });

    test('should handle zero retention days', () => {
      manager.retentionDays = 0;

      fs.readdirSync.mockReturnValue(['log.log']);

      expect(() => manager.rotateOldLogs()).not.toThrow();
    });

    test('should handle negative retention days', () => {
      manager.retentionDays = -1;

      fs.readdirSync.mockReturnValue(['log.log']);

      expect(() => manager.rotateOldLogs()).not.toThrow();
    });

    test('should handle file deletion errors', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      fs.readdirSync.mockReturnValue(['protected-log.log']);
      fs.statSync.mockReturnValue({
        isFile: () => true,
        mtime: oldDate,
        size: 1024
      });
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => manager.rotateOldLogs()).not.toThrow();
    });
  });

  describe('Integration', () => {
    test('should work with start/stop cycle', () => {
      manager.start();
      expect(manager.initialTimeout).not.toBeNull();

      manager.stop();
      expect(manager.initialTimeout).toBeNull();
    });

    test('should handle multiple start calls', () => {
      manager.start();

      manager.start();

      expect(manager.initialTimeout).toBeDefined();
      
      manager.stop();
    });

    test('should handle rapid start/stop', () => {
      manager.start();
      manager.stop();
      manager.start();
      manager.stop();

      expect(manager.initialTimeout).toBeNull();
      expect(manager.rotationInterval).toBeNull();
    });
  });

  describe('Performance', () => {
    test('should handle large number of files efficiently', () => {
      const manyFiles = Array(1000).fill('log.log').map((name, i) => `${name}-${i}`);
      fs.readdirSync.mockReturnValue(manyFiles);

      const start = Date.now();
      manager.rotateOldLogs();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    test('should handle multiple rotation calls efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        manager.rotateOldLogs();
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Lifecycle', () => {
    test('should cleanup on stop', () => {
      manager.start();

      manager.stop();

      expect(manager.initialTimeout).toBeNull();
      expect(manager.rotationInterval).toBeNull();
    });

    test('should not throw when stopping already stopped manager', () => {
      manager.stop();
      expect(() => manager.stop()).not.toThrow();
    });
  });
});
