import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function Settings() {
  const [formData, setFormData] = useState({
    host: '',
    port: 8728,
    user: 'admin',
    password: '',
    timeout: 5000, // 5 seconds
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    model?: string;
    version?: string;
  } | null>(null);

  const testConnectionMutation = trpc.mikrotik.testConnection.useMutation({
    onSuccess: (result) => {
      setTestResult({
        success: true,
        message: result.message,
        model: result.model,
        version: result.version,
      });
      toast.success('Conexão estabelecida com sucesso!');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Falha desconhecida na conexão';
      setTestResult({
        success: false,
        message: errorMessage,
      });
      toast.error(`Falha na conexão: ${errorMessage}`);
      console.error('Connection error:', error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' || name === 'timeout' ? parseInt(value, 10) : value,
    }));
  };

  const handleTestConnection = () => {
    if (!formData.host || !formData.user || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    testConnectionMutation.mutate({
      host: formData.host,
      port: formData.port,
      user: formData.user,
      password: formData.password,
      timeout: formData.timeout,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">Configure sua conexão com o MikroTik RouterOS</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Dispositivo MikroTik</CardTitle>
          <CardDescription>
            Insira as credenciais de acesso ao seu RouterOS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="host">Endereço IP ou Hostname *</Label>
            <Input
              id="host"
              name="host"
              placeholder="192.168.88.1 ou router.local"
              value={formData.host}
              onChange={handleInputChange}
              disabled={testConnectionMutation.isPending}
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
                value={formData.port}
                onChange={handleInputChange}
                disabled={testConnectionMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Usuário *</Label>
              <Input
                id="user"
                name="user"
                placeholder="admin"
                value={formData.user}
                onChange={handleInputChange}
                disabled={testConnectionMutation.isPending}
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
              value={formData.password}
              onChange={handleInputChange}
              disabled={testConnectionMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (ms) - Padrão: 30000</Label>
            <Input
              id="timeout"
              name="timeout"
              type="number"
                placeholder="5000"
              value={formData.timeout}
              onChange={handleInputChange}
              disabled={testConnectionMutation.isPending}
              min="1000"
              max="120000"
            />
            <p className="text-xs text-muted-foreground">
              Tempo máximo de espera para conexão em ms (padrão: 5000). Aumente se o RouterOS está em rede remota/WAN.
            </p>
          </div>

          <Button
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending}
            className="w-full"
          >
            {testConnectionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando conexão...
              </>
            ) : (
              'Testar Conexão'
            )}
          </Button>

          {testResult && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                testResult.success
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? 'Sucesso' : 'Erro'}
                  </p>
                  <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.message}
                  </p>
                  {testResult.model && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p><strong>Modelo:</strong> {testResult.model}</p>
                      <p><strong>Versão:</strong> {testResult.version}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
