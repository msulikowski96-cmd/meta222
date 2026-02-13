import { useState, useEffect, useCallback } from 'react';
import type { Measurement, UserData } from '@/types';

const STORAGE_KEY = 'metabolic_ai_history';

export interface UseMeasurementHistoryReturn {
  measurements: Measurement[];
  addMeasurement: (userData: UserData, notes?: string) => void;
  deleteMeasurement: (id: string) => void;
  clearHistory: () => void;
  getMeasurementsByDateRange: (start: Date, end: Date) => Measurement[];
  getLatestMeasurement: () => Measurement | null;
  getProgress: (days: number) => { weightChange: number; bmiChange: number } | null;
}

export const useMeasurementHistory = (): UseMeasurementHistoryReturn => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const measurementsWithDates = parsed.map((m: { id: string; date: string; weight: number; bmi: number; bodyFat?: number; waist?: number; notes?: string }) => ({
          ...m,
          date: new Date(m.date)
        }));
        setMeasurements(measurementsWithDates);
      }
    } catch (error) {
      console.error('Error loading measurement history:', error);
    }
    setIsLoaded(true);
  }, []);
  
  // Save to localStorage whenever measurements change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
      } catch (error) {
        console.error('Error saving measurement history:', error);
      }
    }
  }, [measurements, isLoaded]);
  
  const addMeasurement = useCallback((userData: UserData, notes?: string) => {
    // Calculate results for this measurement
    const heightM = userData.height / 100;
    const bmi = userData.weight / (heightM * heightM);
    
    // Calculate body fat if measurements available
    let bodyFat: number | undefined;
    if (userData.waist && userData.neck) {
      if (userData.gender === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(userData.waist - userData.neck) + 0.15456 * Math.log10(userData.height)) - 450;
      } else if (userData.hip) {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(userData.waist + userData.hip - userData.neck) + 0.22100 * Math.log10(userData.height)) - 450;
      }
      if (bodyFat && (bodyFat < 0 || bodyFat > 60)) {
        bodyFat = undefined;
      }
    }
    
    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      date: new Date(),
      weight: userData.weight,
      bmi: Math.round(bmi * 10) / 10,
      bodyFat: bodyFat ? Math.round(bodyFat * 10) / 10 : undefined,
      waist: userData.waist,
      notes
    };
    
    setMeasurements(prev => [newMeasurement, ...prev]);
  }, []);
  
  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);
  
  const clearHistory = useCallback(() => {
    if (confirm('Czy na pewno chcesz usunąć całą historię pomiarów?')) {
      setMeasurements([]);
    }
  }, []);
  
  const getMeasurementsByDateRange = useCallback((start: Date, end: Date) => {
    return measurements.filter(m => m.date >= start && m.date <= end);
  }, [measurements]);
  
  const getLatestMeasurement = useCallback(() => {
    return measurements.length > 0 ? measurements[0] : null;
  }, [measurements]);
  
  const getProgress = useCallback((days: number) => {
    if (measurements.length < 2) return null;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMeasurements = measurements.filter(m => m.date >= cutoffDate);
    if (recentMeasurements.length < 2) return null;
    
    const oldest = recentMeasurements[recentMeasurements.length - 1];
    const newest = recentMeasurements[0];
    
    return {
      weightChange: Math.round((newest.weight - oldest.weight) * 10) / 10,
      bmiChange: Math.round((newest.bmi - oldest.bmi) * 10) / 10
    };
  }, [measurements]);
  
  return {
    measurements,
    addMeasurement,
    deleteMeasurement,
    clearHistory,
    getMeasurementsByDateRange,
    getLatestMeasurement,
    getProgress
  };
};

export default useMeasurementHistory;
