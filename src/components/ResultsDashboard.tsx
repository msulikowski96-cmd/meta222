import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { MetabolicResults } from '@/types';
import { 
  TrendingUp, 
  Flame, 
  Activity, 
  Ruler, 
  Percent, 
  Droplets, 
  Scale,
  Target,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ResultsDashboardProps {
  results: MetabolicResults;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  badge?: { text: string; color: string };
  icon: React.ReactNode;
  gradient: string;
  progress?: { value: number; max: number };
  tooltip?: string;
}

const MetricCard = ({
  title,
  value,
  unit,
  subtitle,
  badge,
  icon,
  gradient,
  progress,
  tooltip
}: MetricCardProps) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
    <div className={`h-2 ${gradient}`} />
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-1">
                  {title}
                  {tooltip && <Info className="w-3 h-3 text-muted-foreground" />}
                </span>
              </TooltipTrigger>
              {tooltip && (
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {badge && (
          <Badge style={{ backgroundColor: badge.color, color: 'white' }}>
            {badge.text}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold">{value}</span>
        {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      {progress && (
        <div className="mt-3">
          <Progress 
            value={(progress.value / progress.max) * 100} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {progress.value} / {progress.max}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

export const ResultsDashboard = ({ results }: ResultsDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="BMI"
          value={results.bmi}
          badge={{ text: results.bmiZone.label, color: results.bmiZone.color }}
          icon={<Scale className="w-4 h-4" />}
          gradient="bg-gradient-to-r from-blue-400 to-blue-600"
          progress={{ value: results.bmi, max: 40 }}
          tooltip={`Zakres: ${results.bmiZone.range}. ${results.bmiZone.description}`}
        />
        
        <MetricCard
          title="BMR"
          value={results.bmr}
          unit="kcal"
          subtitle="Podstawowa przemiana materii"
          icon={<Flame className="w-4 h-4" />}
          gradient="bg-gradient-to-r from-emerald-400 to-emerald-600"
          tooltip="Basal Metabolic Rate - kalorie spalane w spoczynku"
        />
        
        <MetricCard
          title="TDEE"
          value={results.tdee}
          unit="kcal"
          subtitle="Całkowite dzienne zapotrzebowanie"
          icon={<Activity className="w-4 h-4" />}
          gradient="bg-gradient-to-r from-orange-400 to-orange-600"
          tooltip="Total Daily Energy Expenditure - kalorie potrzebne do utrzymania wagi"
        />
      </div>

      {/* Advanced Metrics */}
      {(results.whtr || results.bai || results.bodyFat) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.whtr && results.whtrZone && (
            <MetricCard
              title="WHtR"
              value={results.whtr}
              badge={{ text: results.whtrZone.label, color: results.whtrZone.color }}
              subtitle="Talija / Wzrost"
              icon={<Ruler className="w-4 h-4" />}
              gradient="bg-gradient-to-r from-purple-400 to-purple-600"
              tooltip="Waist-to-Height Ratio - lepszy wskaźnik ryzyka metabolicznego niż BMI"
            />
          )}
          
          {results.bai && results.baiZone && (
            <MetricCard
              title="BAI"
              value={results.bai}
              unit="%"
              badge={{ text: results.baiZone.label, color: results.baiZone.color }}
              subtitle="Body Adiposity Index"
              icon={<Percent className="w-4 h-4" />}
              gradient="bg-gradient-to-r from-pink-400 to-pink-600"
              tooltip="Szacunek procentu tkanki tłuszczowej na podstawie bioder i wzrostu"
            />
          )}
          
          {results.bodyFat && (
            <MetricCard
              title="Tkanka tłuszczowa"
              value={results.bodyFat}
              unit="%"
              subtitle={results.bodyFatCategory}
              icon={<Target className="w-4 h-4" />}
              gradient="bg-gradient-to-r from-red-400 to-red-600"
              tooltip="Szacunek % tkanki tłuszczowej metodą US Navy"
            />
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Woda dziennie</p>
                <p className="text-lg font-semibold">
                  {(results.waterIntake / 1000).toFixed(1)} L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {results.idealWeight && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Idealna waga</p>
                  <p className="text-lg font-semibold">
                    {results.idealWeight.min}-{results.idealWeight.max} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.lbm && (
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Masa beztłuszczowa</p>
                  <p className="text-lg font-semibold">{results.lbm} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.bmiPrime && (
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Activity className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI Prime</p>
                  <p className="text-lg font-semibold">{results.bmiPrime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Calorie Ranges */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Zakresy kaloryczne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Redukcja (-500)</p>
              <p className="text-xl font-bold text-red-500">{results.tdee - 500} kcal</p>
              <p className="text-xs text-muted-foreground">~0.5 kg/tydzień</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Utrzymanie</p>
              <p className="text-xl font-bold text-green-500">{results.tdee} kcal</p>
              <p className="text-xs text-muted-foreground">Aktualna waga</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Wzrost (+300)</p>
              <p className="text-xl font-bold text-blue-500">{results.tdee + 300} kcal</p>
              <p className="text-xs text-muted-foreground">~0.3 kg/tydzień</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Wzrost (+500)</p>
              <p className="text-xl font-bold text-purple-500">{results.tdee + 500} kcal</p>
              <p className="text-xs text-muted-foreground">~0.5 kg/tydzień</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
