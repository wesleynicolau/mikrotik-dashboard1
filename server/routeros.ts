import { RouterOSAPI } from 'node-routeros';

export interface RouterOSConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  diskUsage?: number;
  diskTotal?: number;
  uptime: string;
  model: string;
  version: string;
}

export interface InterfaceInfo {
  name: string;
  rxBytes: string;
  txBytes: string;
  rxPackets: string;
  txPackets: string;
  running: boolean;
}

export interface RouterOSClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getSystemInfo(): Promise<SystemInfo>;
  getInterfaces(): Promise<InterfaceInfo[]>;
  isConnected(): boolean;
}

/**
 * Create a RouterOS client instance
 * Handles connection and data retrieval from RouterOS devices
 */
export function createRouterOSClient(config: RouterOSConfig): RouterOSClient {
  let api: RouterOSAPI | null = null;
  let isConnectedFlag = false;

  const connect = async (): Promise<void> => {
    try {
      api = new RouterOSAPI({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
      });

      await api.connect();
      isConnectedFlag = true;
      console.log('[RouterOS] Connected successfully');
    } catch (error) {
      isConnectedFlag = false;
      console.error('[RouterOS] Connection failed:', error);
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (api) {
      try {
        await api.close();
        isConnectedFlag = false;
        api = null;
        console.log('[RouterOS] Disconnected');
      } catch (error) {
        console.error('[RouterOS] Error disconnecting:', error);
      }
    }
  };

  const getSystemInfo = async (): Promise<SystemInfo> => {
    if (!api || !isConnectedFlag) {
      throw new Error('RouterOS client not connected');
    }

    try {
      // Get resource info (CPU, memory)
      const resourceData = await api.write('/system/resource/print');
      
      if (!resourceData || resourceData.length === 0) {
        throw new Error('No resource data returned');
      }

      const resource = resourceData[0];
      const cpuUsage = parseInt(resource['cpu-load'] || '0', 10);
      const memoryUsage = parseInt(resource['free-memory'] || '0', 10);
      const memoryTotal = parseInt(resource['total-memory'] || '0', 10);
      const uptime = resource['uptime'] || 'unknown';

      // Get identity info
      const identityData = await api.write('/system/identity/print');
      const identity = identityData?.[0]?.name || 'Unknown';

      // Get package info for version
      const packageData = await api.write('/system/package/print');
      const routerOSPkg = packageData?.find((pkg: any) => pkg.name === 'routeros');
      const version = routerOSPkg?.version || 'Unknown';

      return {
        cpuUsage,
        memoryUsage: memoryTotal - memoryUsage, // Convert free to used
        memoryTotal,
        uptime,
        model: identity,
        version,
      };
    } catch (error) {
      console.error('[RouterOS] Error getting system info:', error);
      throw error;
    }
  };

  const getInterfaces = async (): Promise<InterfaceInfo[]> => {
    if (!api || !isConnectedFlag) {
      throw new Error('RouterOS client not connected');
    }

    try {
      const data = await api.write('/interface/print');

      if (!data || data.length === 0) {
        return [];
      }

      const interfaces: InterfaceInfo[] = data.map((iface: any) => ({
        name: iface.name || 'unknown',
        rxBytes: iface['rx-byte'] || '0',
        txBytes: iface['tx-byte'] || '0',
        rxPackets: iface['rx-packet'] || '0',
        txPackets: iface['tx-packet'] || '0',
        running: iface.running === 'true' || iface.running === true,
      }));

      return interfaces;
    } catch (error) {
      console.error('[RouterOS] Error getting interfaces:', error);
      throw error;
    }
  };

  const isConnected = (): boolean => {
    return isConnectedFlag;
  };

  return {
    connect,
    disconnect,
    getSystemInfo,
    getInterfaces,
    isConnected,
  };
}
