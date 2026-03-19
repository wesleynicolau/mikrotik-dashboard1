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
      [name]: name === 'port' ? parseInt(value, 10) : value,
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
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                testResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    testResult.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {testResult.message}
                </p>
                {testResult.success && testResult.model && (
                  <p className="text-sm text-green-700 mt-1">
                    Modelo: {testResult.model} | Versão: {testResult.version}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações de Conexão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Portas padrão do RouterOS:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>API (não segura): 8728</li>
              <li>API (segura/SSL): 8729</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Requisitos:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>RouterOS 6.0 ou superior</li>
              <li>API habilitada no RouterOS</li>
              <li>Usuário com permissões de leitura</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
