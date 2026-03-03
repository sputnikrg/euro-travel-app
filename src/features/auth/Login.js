import { useState } from 'react';
import { useAuth } from './AuthContext';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false); // Переключатель режимов
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = isRegister 
      ? await signUp({ email, password })
      : await signIn({ email, password });

    if (authError) {
      // Обработка типичных ошибок Supabase
      if (authError.message.includes("Invalid login credentials")) {
        setError("Неверный email или пароль");
      } else if (authError.message.includes("User already registered")) {
        setError("Пользователь с таким email уже существует");
      } else {
        setError(authError.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>{isRegister ? 'Регистрация' : 'Вход в EuroWays'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={styles.input}
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Загрузка...' : (isRegister ? 'Создать аккаунт' : 'Войти')}
        </button>

        <p onClick={() => setIsRegister(!isRegister)} style={styles.toggle}>
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </p>
      </form>
    </div>
  );
};

// Простые стили для наглядности
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' },
  form: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' },
  input: { width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '10px', fontSize: '14px' },
  toggle: { marginTop: '15px', textAlign: 'center', cursor: 'pointer', color: '#007bff', fontSize: '14px' }
};

export default Login;