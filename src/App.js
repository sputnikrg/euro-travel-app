import { useState } from 'react'
import { useTrips } from './features/trips/useTrips'
import { Sidebar } from './layouts/Sidebar'
import { MapView } from './features/map/MapView'
import AddTripForm from './features/trips/AddTripForm'
import { supabase } from './supabaseClient'
import { useEffect } from 'react'
import Login from './features/auth/Login'

function App() {
  // ВАЖНО: вызываем useTrips ОДИН раз
  const { trips, loading, fetchTrips } = useTrips()

  const [selectedTrip, setSelectedTrip] = useState(null)

  const [mode, setMode] = useState("IDLE")
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!user) {
    return <Login />
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>

      <Sidebar
        trips={trips}
        selectedTrip={selectedTrip}
        onSelect={setSelectedTrip}
        loading={loading}
        onAddTrip={() => {
          setSelectedTrip(null)
          setMode("SELECTING_FROM")
        }}
      />

      {mode !== "IDLE" && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 420,
          zIndex: 1000,
          background: 'white',
          padding: 15,
          borderRadius: 10,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          {mode === "SELECTING_FROM" && <div>Выберите точку отправления</div>}
          {mode === "SELECTING_TO" && <div>Выберите точку прибытия</div>}
          {mode === "READY" && <div>Заполните форму рейса</div>}

          <button
            onClick={() => {
              setMode("IDLE")
              setFrom(null)
              setTo(null)
            }}
            style={{
              marginTop: 10,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>
      )}

      <MapView
        selectedTrip={selectedTrip}
        mode={mode}
        setMode={setMode}
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
      />

      {/* ФОРМА ПОЯВЛЯЕТСЯ ТОЛЬКО КОГДА ВЫБРАНЫ 2 ТОЧКИ */}
      {mode === "READY" && (
        <AddTripForm
          from={from}
          to={to}
          onSaved={async () => {
            await fetchTrips()
            setMode("IDLE")
            setFrom(null)
            setTo(null)
          }}
        />
      )}

    </div>
  )
}

export default App