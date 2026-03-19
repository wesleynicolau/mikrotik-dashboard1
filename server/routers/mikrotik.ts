import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { createRouterOSClient, type SystemInfo, type InterfaceInfo } from '../routeros';
import { TRPCError } from '@trpc/server';

// Store active connections in memory (in production, use a proper connection pool)
const activeConnections = new Map<string, any>();

export const mikrotikRouter = router({
  /**
   * Test connection to a MikroTik device
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535).default(8728),
        user: z.string().min(1),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const connectionKey = `${input.host}:${input.port}`;
      
      try {
        const client = createRouterOSClient({
          host: input.host,
          port: input.port,
          user: input.user,
          password: input.password,
        });

        await client.connect();
        
        // Get basic system info to verify connection
        const systemInfo = await client.getSystemInfo();
        
        await client.disconnect();
        
        return {
          success: true,
          message: 'Connection successful',
          model: systemInfo.model,
          version: systemInfo.version,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Connection failed: ${errorMessage}`,
        });
      }
    }),

  /**
   * Get system metrics from a MikroTik device
   */
  getSystemMetrics: protectedProcedure
    .input(
      z.object({
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535).default(8728),
        user: z.string().min(1),
        password: z.string(),
      })
    )
    .query(async ({ input }): Promise<SystemInfo> => {
      try {
        const client = createRouterOSClient({
          host: input.host,
          port: input.port,
          user: input.user,
          password: input.password,
        });

        await client.connect();
        const systemInfo = await client.getSystemInfo();
        await client.disconnect();

        return systemInfo;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to get system metrics: ${errorMessage}`,
        });
      }
    }),

  /**
   * Get interface metrics from a MikroTik device
   */
  getInterfaceMetrics: protectedProcedure
    .input(
      z.object({
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535).default(8728),
        user: z.string().min(1),
        password: z.string(),
      })
    )
    .query(async ({ input }): Promise<InterfaceInfo[]> => {
      try {
        const client = createRouterOSClient({
          host: input.host,
          port: input.port,
          user: input.user,
          password: input.password,
        });

        await client.connect();
        const interfaces = await client.getInterfaces();
        await client.disconnect();

        return interfaces;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to get interface metrics: ${errorMessage}`,
        });
      }
    }),

  /**
   * Get all metrics (system + interfaces) from a MikroTik device
   */
  getAllMetrics: protectedProcedure
    .input(
      z.object({
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535).default(8728),
        user: z.string().min(1),
        password: z.string(),
      })
    )
    .query(
      async ({
        input,
      }): Promise<{
        system: SystemInfo;
        interfaces: InterfaceInfo[];
      }> => {
        try {
          const client = createRouterOSClient({
            host: input.host,
            port: input.port,
            user: input.user,
            password: input.password,
          });

          await client.connect();
          const [systemInfo, interfaces] = await Promise.all([
            client.getSystemInfo(),
            client.getInterfaces(),
          ]);
          await client.disconnect();

          return {
            system: systemInfo,
            interfaces,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Failed to get metrics: ${errorMessage}`,
          });
        }
      }
    ),
});
