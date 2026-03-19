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
 * Classify connection errors to provide specific feedback
 */
function classifyConnectionError(error: unknown): string {
  const errorStr = String(error);
  const errorMsg = error instanceof Error ? error.message : errorStr;
  const errorCode = (error as any)?.code || '';
  const errorErrno = (error as any)?.errno || '';

  console.error('[Error Classification] Raw error details:', {
    message: errorMsg,
    code: errorCode,
    errno: errorErrno,
    fullString: errorStr,
  });

  // Timeout errors
  if (
    errorMsg.toLowerCase().includes('timeout') ||
    errorMsg.includes('ETIMEDOUT') ||
    errorMsg.includes('EHOSTUNREACH') ||
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'EHOSTUNREACH'
  ) {
    return 'TIMEOUT: Não foi possível conectar ao host. Verifique se o IP/hostname e porta estão corretos, e se o firewall não está bloqueando a conexão.';
  }

  // Connection refused (port closed)
  if (
    errorMsg.toLowerCase().includes('refused') ||
    errorMsg.includes('ECONNREFUSED') ||
    errorCode === 'ECONNREFUSED'
  ) {
    return 'CONEXÃO RECUSADA: A porta pode estar fechada ou o RouterOS não está escutando nela. Verifique a porta configurada (padrão: 8728 ou 8729).';
  }

  // Authentication errors
  if (
    errorMsg.toLowerCase().includes('authentication') ||
    errorMsg.toLowerCase().includes('invalid user') ||
    errorMsg.toLowerCase().includes('bad password') ||
    errorMsg.toLowerCase().includes('unauthorized')
  ) {
    return 'AUTENTICAÇÃO FALHOU: Usuário ou senha incorretos. Verifique as credenciais no RouterOS.';
  }

  // Host not found
  if (
    errorMsg.includes('ENOTFOUND') ||
    errorMsg.toLowerCase().includes('getaddrinfo') ||
    errorMsg.toLowerCase().includes('not found') ||
    errorMsg.toLowerCase().includes('eai_again') ||
    errorCode === 'ENOTFOUND'
  ) {
    return 'HOST NÃO ENCONTRADO: O hostname/IP fornecido não pôde ser resolvido. Verifique o endereço do RouterOS.';
  }

  // Network unreachable
  if (
    errorMsg.includes('ENETUNREACH') ||
    errorMsg.toLowerCase().includes('unreachable') ||
    errorCode === 'ENETUNREACH'
  ) {
    return 'REDE INACESSÍVEL: Não há rota para o host. Verifique a conectividade de rede.';
  }

  // Connection reset
  if (
    errorMsg.includes('ECONNRESET') ||
    errorMsg.toLowerCase().includes('reset') ||
    errorCode === 'ECONNRESET'
  ) {
    return 'CONEXÃO RESETADA: O RouterOS fechou a conexão. Pode ser um problema de firewall ou configuração do RouterOS.';
  }

  // Generic connection error
  if (errorMsg.toLowerCase().includes('connect')) {
    return `ERRO DE CONEXÃO: ${errorMsg}`;
  }

  // If we have a specific error message, return it
  if (errorMsg && errorMsg.length > 0) {
    return `ERRO: ${errorMsg}`;
  }

  // Default - include error code if available
  if (errorCode) {
    return `ERRO (${errorCode}): Erro desconhecido na conexão. Verifique os dados de conexão e tente novamente.`;
  }

  return 'ERRO: Erro desconhecido na conexão. Verifique os dados de conexão e tente novamente.';
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
      console.log('[RouterOS] Attempting to connect to', config.host, 'on port', config.port);
      api = new RouterOSAPI({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
      });

      await api.connect();
      isConnectedFlag = true;
      console.log('[RouterOS] Connected successfully to', config.host);
    } catch (error) {
      isConnectedFlag = false;
      const classifiedError = classifyConnectionError(error);
      console.error('[RouterOS] Connection failed:', classifiedError);
      throw new Error(classifiedError);
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
        throw new Error('No resource data returned from RouterOS');
      }

      const resource = resourceData[0];
      const cpuUsage = parseInt(resource['cpu-load'] || '0', 10);
      const memoryUsage = parseInt(resource['free-memory'] || '0', 10);
      const memoryTotal = parseInt(resource['total-memory'] || '0', 10);
      const uptime = resource['uptime'] || 'unknown';

      // Get identity info
      const identityData = await api.write('/system/identity/print');
      const identity = identityData?.[0]?.name || 'Unknown';

      // Get RouterOS version
      const packageData = await api.write('/system/package/print');
      const routerosPackage = packageData?.find((pkg: any) => pkg.name === 'routeros');
      const version = routerosPackage?.version || 'Unknown';

      // Get board name (model)
      const boardData = await api.write('/system/routerboard/print');
      const model = boardData?.[0]?.['model-name'] || boardData?.[0]?.['board-name'] || 'Unknown';

      return {
        cpuUsage,
        memoryUsage,
        memoryTotal,
        uptime,
        model,
        version,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get system info: ${errorMsg}`);
    }
  };

  const getInterfaces = async (): Promise<InterfaceInfo[]> => {
    if (!api || !isConnectedFlag) {
      throw new Error('RouterOS client not connected');
    }

    try {
      const interfaceData = await api.write('/interface/print');
      
      if (!interfaceData) {
        return [];
      }

      return interfaceData.map((iface: any) => ({
        name: iface.name || 'unknown',
        rxBytes: iface['rx-byte'] || '0',
        txBytes: iface['tx-byte'] || '0',
        rxPackets: iface['rx-packet'] || '0',
        txPackets: iface['tx-packet'] || '0',
        running: iface.running === true,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get interfaces: ${errorMsg}`);
    }
  };

  const isConnected = (): boolean => {
    return isConnectedFlag && api !== null;
  };

  return {
    connect,
    disconnect,
    getSystemInfo,
    getInterfaces,
    isConnected,
  };
}
