import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setTrips(data)
    }

    setLoading(false)
  }

  return { trips, loading, fetchTrips }
}