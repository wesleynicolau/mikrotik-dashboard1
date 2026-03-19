import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  percentage?: number;
  status?: 'normal' | 'warning' | 'critical';
  description?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  percentage,
  status = 'normal',
  description,
}: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getProgressColor = () => {
    if (percentage === undefined) return 'bg-blue-500';
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getStatusColor()}`}>
              {value}
            </span>
            {unit && <span className="text-muted-foreground text-sm">{unit}</span>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {percentage !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Uso</span>
              <span className="font-semibold">{percentage}%</span>
            </div>
            <Progress
              value={percentage}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
