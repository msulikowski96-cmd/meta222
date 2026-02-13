// Types for MetabolicAI Pro

export interface UserData {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  waist?: number; // cm (for WHtR)
  hip?: number; // cm (for BAI)
  neck?: number; // cm (for body fat %)
}

export type ActivityLevel = 
  | 'sedentary' 
  | 'light' 
  | 'moderate' 
  | 'active' 
  | 'very-active';

export interface ActivityLevelOption {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}

export interface BMIZone {
  label: string;
  color: string;
  range: string;
  description: string;
}

export interface MetabolicResults {
  bmi: number;
  bmiZone: BMIZone;
  bmr: number;
  tdee: number;
  whtr?: number;
  whtrZone?: BMIZone;
  bai?: number;
  baiZone?: BMIZone;
  bodyFat?: number;
  bodyFatCategory?: string;
  lbm?: number; // Lean Body Mass
  idealWeight?: {
    min: number;
    max: number;
  };
  waterIntake: number;
  bmiPrime?: number;
  ponderalIndex?: number;
}

export interface Recommendation {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  category: 'nutrition' | 'exercise' | 'hydration' | 'sleep' | 'general';
}

export interface HealthGoal {
  id: string;
  type: 'weight' | 'bodyFat' | 'bmi' | 'water' | 'exercise';
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  createdAt: Date;
}

export interface Measurement {
  id: string;
  date: Date;
  weight: number;
  bmi: number;
  bodyFat?: number;
  waist?: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: FoodItem[];
}

export interface FoodItem {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}
