import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Measurement } from '@/types';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  History, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Trash2, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface MeasurementHistoryProps {
  measurements: Measurement[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const MeasurementHistory = ({ 
  measurements, 
  onDelete,
  onClear 
}: MeasurementHistoryProps) => {
  const [showTable, setShowTable] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bmi' | 'bodyFat'>('weight');

  if (measurements.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Brak zapisanych pomiarów</p>
          <p className="text-sm text-muted-foreground mt-1">
            Twoje pomiary będą pojawiać się tutaj po zapisaniu
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = [...measurements]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(m => ({
      date: format(m.date, 'dd.MM'),
      fullDate: format(m.date, 'dd MMMM yyyy', { locale: pl }),
      weight: m.weight,
      bmi: m.bmi,
      bodyFat: m.bodyFat
    }));

  // Calculate progress
  const latest = measurements[0];
  const oldest = measurements[measurements.length - 1];
  const weightChange = latest.weight - oldest.weight;
  const bmiChange = latest.bmi - oldest.bmi;

  const getProgressIcon = (change: number) => {
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const metricConfig = {
    weight: { label: 'Waga (kg)', color: '#10B981', fillColor: '#10B98120' },
    bmi: { label: 'BMI', color: '#3B82F6', fillColor: '#3B82F620' },
    bodyFat: { label: 'Tkanka tłuszczowa (%)', color: '#F59E0B', fillColor: '#F59E0B20' }
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zmiana wagi</p>
                <p className={`text-2xl font-bold ${weightChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </p>
              </div>
              {getProgressIcon(weightChange)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zmiana BMI</p>
                <p className={`text-2xl font-bold ${bmiChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {bmiChange > 0 ? '+' : ''}{bmiChange.toFixed(1)}
                </p>
              </div>
              {getProgressIcon(bmiChange)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historia pomiarów
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'weight' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('weight')}
              >
                Waga
              </Button>
              <Button
                variant={selectedMetric === 'bmi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('bmi')}
              >
                BMI
              </Button>
              <Button
                variant={selectedMetric === 'bodyFat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('bodyFat')}
                disabled={!measurements.some(m => m.bodyFat)}
              >
                % Tłuszczu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`color${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig[selectedMetric].color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricConfig[selectedMetric].color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.fullDate}</p>
                          <p className="text-sm">
                            {metricConfig[selectedMetric].label}: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={metricConfig[selectedMetric].color}
                  fillOpacity={1} 
                  fill={`url(#color${selectedMetric})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Table */}
      <Collapsible open={showTable} onOpenChange={setShowTable}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            {showTable ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            {showTable ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Waga</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>% Tłuszczu</TableHead>
                    <TableHead>Talia</TableHead>
                    <TableHead>Notatki</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(m.date, 'dd.MM.yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{m.weight} kg</TableCell>
                      <TableCell>{m.bmi}</TableCell>
                      <TableCell>{m.bodyFat ? `${m.bodyFat}%` : '-'}</TableCell>
                      <TableCell>{m.waist ? `${m.waist} cm` : '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{m.notes || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(m.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {measurements.length > 0 && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onClear}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Wyczyść historię
        </Button>
      )}
    </div>
  );
};

export default MeasurementHistory;
