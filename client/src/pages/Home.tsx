import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Gauge, Wifi, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">MikroTik Dashboard</h1>
            <p className="text-slate-300">Monitore seus roteadores RouterOS em tempo real</p>
          </div>
          <a href={`/api/oauth/login`}>
            <Button className="w-full" size="lg">
              Fazer Login
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Bem-vindo, {user?.name || 'Usuário'}!
          </h1>
          <p className="text-slate-600">
            Monitore seus roteadores MikroTik RouterOS com métricas em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">CPU em Tempo Real</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">Monitorar</p>
              <p className="text-xs text-slate-500 mt-1">Uso de processador</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Memória</CardTitle>
                <Gauge className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">Visualizar</p>
              <p className="text-xs text-slate-500 mt-1">Consumo de RAM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Interfaces</CardTitle>
                <Wifi className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">Acompanhar</p>
              <p className="text-xs text-slate-500 mt-1">Tráfego de rede</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Histórico</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">Gráficos</p>
              <p className="text-xs text-slate-500 mt-1">Tendências em tempo real</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Comece Agora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              Para começar a monitorar seus roteadores MikroTik, acesse o dashboard e configure sua primeira conexão.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation('/dashboard')}
            >
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuração Fácil</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Configure sua conexão com o RouterOS em segundos. Basta inserir o IP, porta e credenciais.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monitoramento em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Atualizações automáticas com intervalo configurável para acompanhar métricas em tempo real.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gráficos Interativos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Visualize o tráfego de interfaces com gráficos dinâmicos e histórico de dados.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
