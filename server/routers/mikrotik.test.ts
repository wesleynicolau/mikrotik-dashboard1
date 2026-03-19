import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mikrotikRouter } from './mikrotik';
import { TRPCError } from '@trpc/server';

// Mock the RouterOS client
vi.mock('../routeros', () => ({
  createRouterOSClient: vi.fn(),
}));

import { createRouterOSClient } from '../routeros';

describe('mikrotikRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return success with device info on successful connection', async () => {
      const mockClient = {
        connect: vi.fn().mockResolvedValue(undefined),
        getSystemInfo: vi.fn().mockResolvedValue({
          cpuUsage: 25,
          memoryUsage: 512,
          memoryTotal: 1024,
          uptime: '1d 2h 3m',
          model: 'RB4011',
          version: '7.10.1',
        }),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(createRouterOSClient).mockReturnValue(mockClient as any);

      const caller = mikrotikRouter.createCaller({
        user: { id: 1, openId: 'test', name: 'Test', email: 'test@test.com', role: 'user', loginMethod: 'test', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.testConnection({
        host: '192.168.88.1',
        port: 8728,
        user: 'admin',
        password: 'password',
      });

      expect(result.success).toBe(true);
      expect(result.model).toBe('RB4011');
      expect(result.version).toBe('7.10.1');
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should throw error on connection failure', async () => {
      const mockClient = {
        connect: vi.fn().mockRejectedValue(new Error('Connection refused')),
      };

      vi.mocked(createRouterOSClient).mockReturnValue(mockClient as any);

      const caller = mikrotikRouter.createCaller({
        user: { id: 1, openId: 'test', name: 'Test', email: 'test@test.com', role: 'user', loginMethod: 'test', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.testConnection({
          host: '192.168.88.1',
          port: 8728,
          user: 'admin',
          password: 'wrong',
        })
      ).rejects.toThrow();
    });
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics on successful query', async () => {
      const mockClient = {
        connect: vi.fn().mockResolvedValue(undefined),
        getSystemInfo: vi.fn().mockResolvedValue({
          cpuUsage: 45,
          memoryUsage: 768,
          memoryTotal: 1024,
          uptime: '5d 10h 20m',
          model: 'RB3011',
          version: '7.9.2',
        }),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(createRouterOSClient).mockReturnValue(mockClient as any);

      const caller = mikrotikRouter.createCaller({
        user: { id: 1, openId: 'test', name: 'Test', email: 'test@test.com', role: 'user', loginMethod: 'test', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getSystemMetrics({
        host: '192.168.88.1',
        port: 8728,
        user: 'admin',
        password: 'password',
      });

      expect(result.cpuUsage).toBe(45);
      expect(result.memoryUsage).toBe(768);
      expect(result.memoryTotal).toBe(1024);
    });
  });

  describe('getInterfaceMetrics', () => {
    it('should return interface metrics on successful query', async () => {
      const mockClient = {
        connect: vi.fn().mockResolvedValue(undefined),
        getInterfaces: vi.fn().mockResolvedValue([
          {
            name: 'ether1',
            rxBytes: '1000000',
            txBytes: '2000000',
            rxPackets: '5000',
            txPackets: '3000',
            running: true,
          },
          {
            name: 'ether2',
            rxBytes: '500000',
            txBytes: '1000000',
            rxPackets: '2500',
            txPackets: '1500',
            running: false,
          },
        ]),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(createRouterOSClient).mockReturnValue(mockClient as any);

      const caller = mikrotikRouter.createCaller({
        user: { id: 1, openId: 'test', name: 'Test', email: 'test@test.com', role: 'user', loginMethod: 'test', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getInterfaceMetrics({
        host: '192.168.88.1',
        port: 8728,
        user: 'admin',
        password: 'password',
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('ether1');
      expect(result[0].running).toBe(true);
      expect(result[1].name).toBe('ether2');
      expect(result[1].running).toBe(false);
    });
  });

  describe('getAllMetrics', () => {
    it('should return both system and interface metrics', async () => {
      const mockClient = {
        connect: vi.fn().mockResolvedValue(undefined),
        getSystemInfo: vi.fn().mockResolvedValue({
          cpuUsage: 30,
          memoryUsage: 600,
          memoryTotal: 1024,
          uptime: '2d 5h 10m',
          model: 'RB2011',
          version: '7.8.1',
        }),
        getInterfaces: vi.fn().mockResolvedValue([
          {
            name: 'ether1',
            rxBytes: '1500000',
            txBytes: '2500000',
            rxPackets: '7500',
            txPackets: '4500',
            running: true,
          },
        ]),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(createRouterOSClient).mockReturnValue(mockClient as any);

      const caller = mikrotikRouter.createCaller({
        user: { id: 1, openId: 'test', name: 'Test', email: 'test@test.com', role: 'user', loginMethod: 'test', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getAllMetrics({
        host: '192.168.88.1',
        port: 8728,
        user: 'admin',
        password: 'password',
      });

      expect(result.system.cpuUsage).toBe(30);
      expect(result.system.model).toBe('RB2011');
      expect(result.interfaces).toHaveLength(1);
      expect(result.interfaces[0].name).toBe('ether1');
    });
  });
});
