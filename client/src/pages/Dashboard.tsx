import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { MetricCard } from '@/components/MetricCard';
import { InterfaceChart } from '@/components/InterfaceChart';
import { toast } from 'sonner';

interface ChartData {
  time: string;
  rx: number;
  tx: number;
}

export default function Dashboard() {
  const [config, setConfig] = useState({
    host: localStorage.getItem('mikrotik_host') || '',
    port: parseInt(localStorage.getItem('mikrotik_port') || '8728', 10),
    user: localStorage.getItem('mikrotik_user') || '',
    password: localStorage.getItem('mikrotik_password') || '',
  });

  const [isConfigured, setIsConfigured] = useState(!!config.host);
  const [chartData, setChartData] = useState<Record<string, ChartData[]>>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const metricsQuery = trpc.mikrotik.getAllMetrics.useQuery(
    {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    },
    {
      enabled: isConfigured && autoRefresh,
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 0,
    }
  );

  useEffect(() => {
    if (metricsQuery.data?.interfaces) {
      const now = new Date().toLocaleTimeString();

      setChartData(prev => {
        const updated = { ...prev };

        metricsQuery.data.interfaces.forEach(iface => {
          if (!updated[iface.name]) {
            updated[iface.name] = [];
          }

          const rxBytes = parseInt(iface.rxBytes, 10);
          const txBytes = parseInt(iface.txBytes, 10);

          updated[iface.name].push({
            time: now,
            rx: rxBytes,
            tx: txBytes,
          });

          // Keep only last 20 data points
          if (updated[iface.name].length > 20) {
            updated[iface.name] = updated[iface.name].slice(-20);
          }
        });

        return updated;
      });
    }
  }, [metricsQuery.data?.interfaces]);

  const handleSaveConfig = () => {
    if (!config.host || !config.user || !config.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    localStorage.setItem('mikrotik_host', config.host);
    localStorage.setItem('mikrotik_port', config.port.toString());
    localStorage.setItem('mikrotik_user', config.user);
    localStorage.setItem('mikrotik_password', config.password);

    setIsConfigured(true);
    toast.success('Configuração salva! Conectando...');
    metricsQuery.refetch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value, 10) : value,
    }));
  };

  const handleManualRefresh = () => {
    metricsQuery.refetch();
    toast.success('Dados atualizados');
  };

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard MikroTik</h1>
          <p className="text-muted-foreground mt-2">
            Configure sua conexão para começar a monitorar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração Inicial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="host">Endereço IP ou Hostname *</Label>
              <Input
                id="host"
                name="host"
                placeholder="192.168.88.1"
                value={config.host}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="port">Porta *</Label>
                <Input
                  id="port"
                  name="port"
                  type="number"
                  placeholder="8728"
                  value={config.port}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">Usuário *</Label>
                <Input
                  id="user"
                  name="user"
                  placeholder="admin"
                  value={config.user}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Sua senha"
                value={config.password}
                onChange={handleInputChange}
              />
            </div>

            <Button onClick={handleSaveConfig} className="w-full">
              Conectar ao RouterOS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const systemInfo = metricsQuery.data?.system;
  const interfaces = metricsQuery.data?.interfaces || [];

  const cpuPercentage = systemInfo?.cpuUsage || 0;
  const memoryPercentage = systemInfo
    ? Math.round((systemInfo.memoryUsage / systemInfo.memoryTotal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard MikroTik</h1>
          <div className="flex items-center gap-2 mt-2">
            {metricsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Atualizando...</span>
              </div>
            ) : metricsQuery.isError ? (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span>Desconectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="h-4 w-4" />
                <span>Conectado</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={metricsQuery.isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsConfigured(false);
              localStorage.clear();
            }}
          >
            Desconectar
          </Button>
        </div>
      </div>

      {metricsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Erro de Conexão</p>
            <p className="text-sm text-red-700 mt-1">
              {metricsQuery.error?.message || 'Não foi possível conectar ao RouterOS'}
            </p>
          </div>
        </div>
      )}

      {systemInfo && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="CPU"
              value={cpuPercentage}
              unit="%"
              percentage={cpuPercentage}
              status={cpuPercentage > 80 ? 'critical' : cpuPercentage > 60 ? 'warning' : 'normal'}
            />

            <MetricCard
              title="Memória"
              value={`${(systemInfo.memoryUsage / 1024 / 1024).toFixed(1)}`}
              unit="MB"
              percentage={memoryPercentage}
              description={`de ${(systemInfo.memoryTotal / 1024 / 1024).toFixed(1)} MB`}
              status={memoryPercentage > 80 ? 'critical' : memoryPercentage > 60 ? 'warning' : 'normal'}
            />

            <MetricCard
              title="Modelo"
              value={systemInfo.model}
              description="RouterOS"
            />

            <MetricCard
              title="Versão"
              value={systemInfo.version}
              description="RouterOS"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold">{systemInfo.uptime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interfaces Ativas</p>
                <p className="text-lg font-semibold">
                  {interfaces.filter(i => i.running).length} / {interfaces.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-lg font-semibold">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Interfaces de Rede</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {interfaces.map(iface => (
                <InterfaceChart
                  key={iface.name}
                  title={`${iface.name} ${iface.running ? '(Ativo)' : '(Inativo)'}`}
                  data={chartData[iface.name] || []}
                  isLoading={metricsQuery.isLoading}
                />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Atualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={e => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span>Atualização Automática</span>
                </label>
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label>Intervalo de Atualização (ms)</Label>
                  <Input
                    type="number"
                    value={refreshInterval}
                    onChange={e => setRefreshInterval(parseInt(e.target.value, 10))}
                    min={1000}
                    step={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo: 1000ms (1 segundo)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
