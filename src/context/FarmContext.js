'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFarms = useCallback(async () => {
    if (!user || user.role !== 'farmer') return;
    setLoading(true);
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success && data.data) {
        setFarms(data.data);
        if (data.data.length > 0 && !activeFarm) {
          setActiveFarm(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load farms', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeFarm]);

  const fetchCrops = useCallback(async (farmId) => {
    if (!user) return;
    try {
      const url = farmId ? `/api/crops?farmId=${farmId}` : '/api/crops';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCrops(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load crops', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFarms();
    } else {
      setFarms([]);
      setActiveFarm(null);
      setCrops([]);
    }
  }, [user, fetchFarms]);

  useEffect(() => {
    if (activeFarm) {
      fetchCrops(activeFarm._id);
    }
  }, [activeFarm, fetchCrops]);

  return (
    <FarmContext.Provider
      value={{
        farms,
        activeFarm,
        setActiveFarm,
        crops,
        loading,
        refetchFarms: fetchFarms,
        refetchCrops: () => fetchCrops(activeFarm?._id),
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
