import { useState, useEffect, useCallback } from 'react';
import type { HealthGoal } from '@/types';

const STORAGE_KEY = 'metabolic_ai_goals';

export interface UseHealthGoalsReturn {
  goals: HealthGoal[];
  addGoal: (goal: Omit<HealthGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<HealthGoal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalComplete: (id: string) => void;
  getGoalsByType: (type: HealthGoal['type']) => HealthGoal[];
  getActiveGoals: () => HealthGoal[];
  getCompletedGoals: () => HealthGoal[];
  calculateProgress: (goal: HealthGoal) => number;
}

export const useHealthGoals = (): UseHealthGoalsReturn => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const goalsWithDates = parsed.map((g: { id: string; type: HealthGoal['type']; target: number; current: number; unit: string; deadline?: string; createdAt: string }) => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline) : undefined,
          createdAt: new Date(g.createdAt)
        }));
        setGoals(goalsWithDates);
      }
    } catch (error) {
      console.error('Error loading health goals:', error);
    }
    setIsLoaded(true);
  }, []);
  
  // Save to localStorage whenever goals change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
      } catch (error) {
        console.error('Error saving health goals:', error);
      }
    }
  }, [goals, isLoaded]);
  
  const addGoal = useCallback((goal: Omit<HealthGoal, 'id' | 'createdAt'>) => {
    const newGoal: HealthGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);
  
  const updateGoal = useCallback((id: string, updates: Partial<HealthGoal>) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, ...updates } : g
    ));
  }, []);
  
  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);
  
  const toggleGoalComplete = useCallback((id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const isComplete = g.current >= g.target;
        return {
          ...g,
          current: isComplete ? g.target * 0.9 : g.target
        };
      }
      return g;
    }));
  }, []);
  
  const getGoalsByType = useCallback((type: HealthGoal['type']) => {
    return goals.filter(g => g.type === type);
  }, [goals]);
  
  const getActiveGoals = useCallback(() => {
    return goals.filter(g => g.current < g.target);
  }, [goals]);
  
  const getCompletedGoals = useCallback(() => {
    return goals.filter(g => g.current >= g.target);
  }, [goals]);
  
  const calculateProgress = useCallback((goal: HealthGoal): number => {
    if (goal.type === 'weight' || goal.type === 'bodyFat') {
      // For weight/body fat goals, progress is inverse if losing
      if (goal.target < goal.current) {
        // Losing weight
        const startWeight = goal.current;
        const targetWeight = goal.target;
        const lost = startWeight - goal.current;
        const toLose = startWeight - targetWeight;
        return Math.min(100, Math.max(0, (lost / toLose) * 100));
      }
    }
    // Standard progress
    return Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
  }, []);
  
  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalComplete,
    getGoalsByType,
    getActiveGoals,
    getCompletedGoals,
    calculateProgress
  };
};

export default useHealthGoals;
