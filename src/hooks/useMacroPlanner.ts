import { useState, useEffect, useCallback } from 'react';
import type { MacroTargets, Meal, FoodItem } from '@/types';

const STORAGE_KEY = 'metabolic_ai_meals';

export interface UseMacroPlannerReturn {
  meals: Meal[];
  macroTargets: MacroTargets;
  setMacroTargets: (targets: MacroTargets) => void;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  addFoodToMeal: (mealId: string, food: Omit<FoodItem, 'calories' | 'protein' | 'carbs' | 'fat'>) => void;
  removeFoodFromMeal: (mealId: string, foodIndex: number) => void;
  getDailyTotals: () => { calories: number; protein: number; carbs: number; fat: number };
  getRemainingMacros: () => { calories: number; protein: number; carbs: number; fat: number };
  getMacroPercentages: () => { protein: number; carbs: number; fat: number };
  generateMealPlan: (tdee: number, goal: 'maintain' | 'lose' | 'gain') => void;
}

// Default macro split: 30% protein, 40% carbs, 30% fat
const calculateMacrosFromCalories = (calories: number): MacroTargets => {
  const proteinPercent = 30;
  const carbsPercent = 40;
  const fatPercent = 30;
  
  const protein = Math.round((calories * proteinPercent / 100) / 4);
  const carbs = Math.round((calories * carbsPercent / 100) / 4);
  const fat = Math.round((calories * fatPercent / 100) / 9);
  
  return {
    calories,
    protein,
    carbs,
    fat,
    proteinPercent,
    carbsPercent,
    fatPercent
  };
};

export const useMacroPlanner = (): UseMacroPlannerReturn => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [macroTargets, setMacroTargetsState] = useState<MacroTargets>(
    calculateMacrosFromCalories(2000)
  );
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedMeals = localStorage.getItem(STORAGE_KEY);
      const storedTargets = localStorage.getItem(STORAGE_KEY + '_targets');
      
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals));
      }
      if (storedTargets) {
        setMacroTargetsState(JSON.parse(storedTargets));
      }
    } catch (error) {
      console.error('Error loading macro planner data:', error);
    }
    setIsLoaded(true);
  }, []);
  
  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
        localStorage.setItem(STORAGE_KEY + '_targets', JSON.stringify(macroTargets));
      } catch (error) {
        console.error('Error saving macro planner data:', error);
      }
    }
  }, [meals, macroTargets, isLoaded]);
  
  const setMacroTargets = useCallback((targets: MacroTargets) => {
    setMacroTargetsState(targets);
  }, []);
  
  const addMeal = useCallback((meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      calories: meal.foods.reduce((sum, f) => sum + f.calories, 0),
      protein: meal.foods.reduce((sum, f) => sum + f.protein, 0),
      carbs: meal.foods.reduce((sum, f) => sum + f.carbs, 0),
      fat: meal.foods.reduce((sum, f) => sum + f.fat, 0)
    };
    setMeals(prev => [...prev, newMeal]);
  }, []);
  
  const updateMeal = useCallback((id: string, updates: Partial<Meal>) => {
    setMeals(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        // Recalculate macros
        updated.calories = updated.foods.reduce((sum, f) => sum + f.calories, 0);
        updated.protein = updated.foods.reduce((sum, f) => sum + f.protein, 0);
        updated.carbs = updated.foods.reduce((sum, f) => sum + f.carbs, 0);
        updated.fat = updated.foods.reduce((sum, f) => sum + f.fat, 0);
        return updated;
      }
      return m;
    }));
  }, []);
  
  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  }, []);
  
  const addFoodToMeal = useCallback((mealId: string, food: Omit<FoodItem, 'calories' | 'protein' | 'carbs' | 'fat'>) => {
    // Calculate macros based on typical values per 100g
    const foodDatabase: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
      'chicken_breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'oats': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
      'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'greek_yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
      'sweet_potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
      'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1 },
      'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
      'cottage_cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 }
    };
    
    const foodData = foodDatabase[food.name] || { calories: 100, protein: 5, carbs: 15, fat: 3 };
    const multiplier = food.amount / 100;
    
    const fullFoodItem: FoodItem = {
      ...food,
      calories: Math.round(foodData.calories * multiplier),
      protein: Math.round(foodData.protein * multiplier * 10) / 10,
      carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
      fat: Math.round(foodData.fat * multiplier * 10) / 10
    };
    
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        const updatedFoods = [...m.foods, fullFoodItem];
        return {
          ...m,
          foods: updatedFoods,
          calories: updatedFoods.reduce((sum, f) => sum + f.calories, 0),
          protein: updatedFoods.reduce((sum, f) => sum + f.protein, 0),
          carbs: updatedFoods.reduce((sum, f) => sum + f.carbs, 0),
          fat: updatedFoods.reduce((sum, f) => sum + f.fat, 0)
        };
      }
      return m;
    }));
  }, []);
  
  const removeFoodFromMeal = useCallback((mealId: string, foodIndex: number) => {
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        const updatedFoods = m.foods.filter((_, i) => i !== foodIndex);
        return {
          ...m,
          foods: updatedFoods,
          calories: updatedFoods.reduce((sum, f) => sum + f.calories, 0),
          protein: updatedFoods.reduce((sum, f) => sum + f.protein, 0),
          carbs: updatedFoods.reduce((sum, f) => sum + f.carbs, 0),
          fat: updatedFoods.reduce((sum, f) => sum + f.fat, 0)
        };
      }
      return m;
    }));
  }, []);
  
  const getDailyTotals = useCallback(() => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meals]);
  
  const getRemainingMacros = useCallback(() => {
    const totals = getDailyTotals();
    return {
      calories: macroTargets.calories - totals.calories,
      protein: macroTargets.protein - totals.protein,
      carbs: macroTargets.carbs - totals.carbs,
      fat: macroTargets.fat - totals.fat
    };
  }, [getDailyTotals, macroTargets]);
  
  const getMacroPercentages = useCallback(() => {
    const totals = getDailyTotals();
    const totalCalories = totals.calories || 1;
    return {
      protein: Math.round((totals.protein * 4 / totalCalories) * 100),
      carbs: Math.round((totals.carbs * 4 / totalCalories) * 100),
      fat: Math.round((totals.fat * 9 / totalCalories) * 100)
    };
  }, [getDailyTotals]);
  
  const generateMealPlan = useCallback((tdee: number, goal: 'maintain' | 'lose' | 'gain') => {
    let targetCalories = tdee;
    if (goal === 'lose') targetCalories -= 500;
    if (goal === 'gain') targetCalories += 300;
    
    const newTargets = calculateMacrosFromCalories(targetCalories);
    setMacroTargetsState(newTargets);
    
    // Clear existing meals and create sample meal plan
    const sampleMeals: Meal[] = [
      {
        id: 'breakfast',
        name: 'Śniadanie',
        time: '08:00',
        calories: Math.round(targetCalories * 0.25),
        protein: Math.round(newTargets.protein * 0.25),
        carbs: Math.round(newTargets.carbs * 0.3),
        fat: Math.round(newTargets.fat * 0.2),
        foods: [
          { name: 'oats', amount: 80, unit: 'g', calories: 311, protein: 13.5, carbs: 53, fat: 5.5 },
          { name: 'banana', amount: 100, unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
          { name: 'greek_yogurt', amount: 150, unit: 'g', calories: 88, protein: 15, carbs: 5.4, fat: 0.6 }
        ]
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '13:00',
        calories: Math.round(targetCalories * 0.35),
        protein: Math.round(newTargets.protein * 0.35),
        carbs: Math.round(newTargets.carbs * 0.35),
        fat: Math.round(newTargets.fat * 0.35),
        foods: [
          { name: 'chicken_breast', amount: 150, unit: 'g', calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
          { name: 'rice', amount: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
          { name: 'broccoli', amount: 150, unit: 'g', calories: 51, protein: 4.2, carbs: 10.5, fat: 0.6 }
        ]
      },
      {
        id: 'dinner',
        name: 'Kolacja',
        time: '19:00',
        calories: Math.round(targetCalories * 0.3),
        protein: Math.round(newTargets.protein * 0.3),
        carbs: Math.round(newTargets.carbs * 0.25),
        fat: Math.round(newTargets.fat * 0.35),
        foods: [
          { name: 'salmon', amount: 150, unit: 'g', calories: 312, protein: 30, carbs: 0, fat: 19.5 },
          { name: 'sweet_potato', amount: 150, unit: 'g', calories: 129, protein: 2.4, carbs: 30, fat: 0.15 },
          { name: 'spinach', amount: 100, unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }
        ]
      },
      {
        id: 'snack',
        name: 'Przekąska',
        time: '16:00',
        calories: Math.round(targetCalories * 0.1),
        protein: Math.round(newTargets.protein * 0.1),
        carbs: Math.round(newTargets.carbs * 0.1),
        fat: Math.round(newTargets.fat * 0.1),
        foods: [
          { name: 'almonds', amount: 30, unit: 'g', calories: 174, protein: 6.3, carbs: 6.6, fat: 15 }
        ]
      }
    ];
    
    setMeals(sampleMeals);
  }, []);
  
  return {
    meals,
    macroTargets,
    setMacroTargets,
    addMeal,
    updateMeal,
    deleteMeal,
    addFoodToMeal,
    removeFoodFromMeal,
    getDailyTotals,
    getRemainingMacros,
    getMacroPercentages,
    generateMealPlan
  };
};

export default useMacroPlanner;
