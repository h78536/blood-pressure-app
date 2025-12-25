"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BloodPressureReading } from '@/lib/types';

const STORAGE_KEY = 'bloodPressureReadings';

export function useBloodPressureData(): [
  BloodPressureReading[], 
  (reading: Omit<BloodPressureReading, 'id' | 'timestamp'>) => void,
  (id: string) => void
] {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        const parsedItems = JSON.parse(items) as BloodPressureReading[];
        // Sort by date descending
        parsedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setReadings(parsedItems);
      }
    } catch (error) {
      console.error("Failed to load readings from localStorage", error);
    }
  }, []);
  
  const persistReadings = (updatedReadings: BloodPressureReading[]) => {
     try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
      } catch (error) {
        console.error("Failed to save readings to localStorage", error);
      }
  };

  const addReading = useCallback((reading: Omit<BloodPressureReading, 'id' | 'timestamp'>) => {
    const newReading: BloodPressureReading = {
      ...reading,
      id: new Date().getTime().toString(),
      timestamp: new Date().toISOString(),
    };

    setReadings(prevReadings => {
      const updatedReadings = [newReading, ...prevReadings];
      persistReadings(updatedReadings);
      return updatedReadings;
    });
  }, []);

  const deleteReading = useCallback((id: string) => {
    setReadings(prevReadings => {
      const updatedReadings = prevReadings.filter(r => r.id !== id);
      persistReadings(updatedReadings);
      return updatedReadings;
    });
  }, []);

  return [readings, addReading, deleteReading];
}