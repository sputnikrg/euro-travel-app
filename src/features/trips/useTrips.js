import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async (userId = null) => {
    setLoading(true);
    
    // Начинаем запрос
    let query = supabase.from('trips').select('*');

    // Если передан userId, фильтруем записи
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      setTrips(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, fetchTrips };
};