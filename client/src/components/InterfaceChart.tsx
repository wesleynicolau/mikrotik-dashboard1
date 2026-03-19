import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InterfaceChartData {
  time: string;
  rx: number;
  tx: number;
}

interface InterfaceChartProps {
  title: string;
  data: InterfaceChartData[];
  isLoading?: boolean;
}

export function InterfaceChart({ title, data, isLoading }: InterfaceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Bytes/s', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) => [
                `${(Number(value) / 1024 / 1024).toFixed(2)} MB/s`,
                '',
              ]}
              labelFormatter={(label) => `Tempo: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rx"
              stroke="#3b82f6"
              dot={false}
              name="Download (RX)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="tx"
              stroke="#ef4444"
              dot={false}
              name="Upload (TX)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
