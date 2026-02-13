import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Meal, FoodItem } from '@/types';
import { 
  Utensils, 
  Plus, 
  Trash2, 
  Target, 
  Flame,
  Beef,
  Wheat,
  Droplets,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface MacroPlannerProps {
  meals: Meal[];
  macroTargets: { calories: number; protein: number; carbs: number; fat: number };
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number };
  remainingMacros: { calories: number; protein: number; carbs: number; fat: number };
  macroPercentages: { protein: number; carbs: number; fat: number };
  onGeneratePlan: (tdee: number, goal: 'maintain' | 'lose' | 'gain') => void;
  onAddFood: (mealId: string, food: Omit<FoodItem, 'calories' | 'protein' | 'carbs' | 'fat'>) => void;
  onRemoveFood: (mealId: string, foodIndex: number) => void;
}

const foodDatabase = [
  { name: 'chicken_breast', label: 'Pierś z kurczaka', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'rice', label: 'Ryż biały', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'oats', label: 'Płatki owsiane', calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: 'eggs', label: 'Jajka', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'salmon', label: 'Łosoś', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'broccoli', label: 'Brokuły', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'banana', label: 'Banan', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'greek_yogurt', label: 'Jogurt grecki', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: 'almonds', label: 'Migdały', calories: 579, protein: 21, carbs: 22, fat: 50 },
  { name: 'sweet_potato', label: 'Batat', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'tuna', label: 'Tuńczyk', calories: 132, protein: 28, carbs: 0, fat: 1 },
  { name: 'avocado', label: 'Awokado', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'spinach', label: 'Szpinak', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: 'quinoa', label: 'Komosa ryżowa', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'cottage_cheese', label: 'Serek wiejski', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 }
];

export const MacroPlanner = ({
  meals,
  macroTargets,
  dailyTotals,
  remainingMacros,
  macroPercentages,
  onGeneratePlan,
  onAddFood,
  onRemoveFood
}: MacroPlannerProps) => {
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [foodAmount, setFoodAmount] = useState<string>('100');
  const [tdeeInput, setTdeeInput] = useState<string>('2000');
  const [goalType, setGoalType] = useState<'maintain' | 'lose' | 'gain'>('maintain');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddFood = () => {
    if (selectedMeal && selectedFood && foodAmount) {
      onAddFood(selectedMeal, {
        name: selectedFood,
        amount: Number(foodAmount),
        unit: 'g'
      });
      setSelectedFood('');
      setFoodAmount('100');
      setDialogOpen(false);
    }
  };

  const handleGeneratePlan = () => {
    onGeneratePlan(Number(tdeeInput), goalType);
  };

  const pieData = [
    { name: 'Białko', value: macroPercentages.protein, color: '#10B981' },
    { name: 'Węglowodany', value: macroPercentages.carbs, color: '#3B82F6' },
    { name: 'Tłuszcze', value: macroPercentages.fat, color: '#F59E0B' }
  ];

  const getProgressColor = (consumed: number, target: number) => {
    const percentage = (consumed / target) * 100;
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Macro Targets Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ustaw cele
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>TDEE (kcal)</Label>
              <Input
                type="number"
                value={tdeeInput}
                onChange={(e) => setTdeeInput(e.target.value)}
                placeholder="2000"
              />
            </div>
            <div>
              <Label>Cel</Label>
              <Select value={goalType} onValueChange={(v) => setGoalType(v as 'maintain' | 'lose' | 'gain')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintain">Utrzymanie</SelectItem>
                  <SelectItem value="lose">Redukcja</SelectItem>
                  <SelectItem value="gain">Wzrost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGeneratePlan} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generuj plan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Kalorie</p>
              <p className="text-xl font-bold">{macroTargets.calories}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Białko</p>
              <p className="text-xl font-bold text-green-600">{macroTargets.protein}g</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Węgle</p>
              <p className="text-xl font-bold text-blue-600">{macroTargets.carbs}g</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Tłuszcze</p>
              <p className="text-xl font-bold text-amber-600">{macroTargets.fat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Dzisiejsze podsumowanie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Kalorie</span>
                <span className="text-sm font-medium">
                  {dailyTotals.calories} / {macroTargets.calories} kcal
                </span>
              </div>
              <Progress 
                value={(dailyTotals.calories / macroTargets.calories) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pozostało: {remainingMacros.calories} kcal
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Beef className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Białko</span>
                </div>
                <Progress 
                  value={(dailyTotals.protein / macroTargets.protein) * 100}
                  className={`h-2 ${getProgressColor(dailyTotals.protein, macroTargets.protein)}`}
                />
                <p className="text-xs mt-1">{dailyTotals.protein}/{macroTargets.protein}g</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Wheat className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Węgle</span>
                </div>
                <Progress 
                  value={(dailyTotals.carbs / macroTargets.carbs) * 100}
                  className={`h-2 ${getProgressColor(dailyTotals.carbs, macroTargets.carbs)}`}
                />
                <p className="text-xs mt-1">{dailyTotals.carbs}/{macroTargets.carbs}g</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Droplets className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Tłuszcze</span>
                </div>
                <Progress 
                  value={(dailyTotals.fat / macroTargets.fat) * 100}
                  className={`h-2 ${getProgressColor(dailyTotals.fat, macroTargets.fat)}`}
                />
                <p className="text-xs mt-1">{dailyTotals.fat}/{macroTargets.fat}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rozkład makroskładników</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Posiłki
          </h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj produkt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj produkt do posiłku</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Posiłek</Label>
                  <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz posiłek" />
                    </SelectTrigger>
                    <SelectContent>
                      {meals.map((meal) => (
                        <SelectItem key={meal.id} value={meal.id}>
                          {meal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Produkt</Label>
                  <Select value={selectedFood} onValueChange={setSelectedFood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz produkt" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodDatabase.map((food) => (
                        <SelectItem key={food.name} value={food.name}>
                          {food.label} ({food.calories} kcal/100g)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ilość (g)</Label>
                  <Input
                    type="number"
                    value={foodAmount}
                    onChange={(e) => setFoodAmount(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <Button onClick={handleAddFood} className="w-full">
                  Dodaj
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{meal.name}</CardTitle>
                  <Badge variant="outline">{meal.time}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                  <span>{meal.calories} kcal</span>
                  <span>P: {meal.protein}g</span>
                  <span>W: {meal.carbs}g</span>
                  <span>T: {meal.fat}g</span>
                </div>
                
                {meal.foods.length > 0 && (
                  <div className="space-y-1">
                    {meal.foods.map((food, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded"
                      >
                        <span>
                          {foodDatabase.find(f => f.name === food.name)?.label || food.name} 
                          ({food.amount}g)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFood(meal.id, idx)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MacroPlanner;
