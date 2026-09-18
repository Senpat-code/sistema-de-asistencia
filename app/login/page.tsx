'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError('Contraseña incorrecta');
      setCargando(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={styles.contenedor}>
      <form onSubmit={handleSubmit} style={styles.tarjeta}>
        <h1 style={styles.titulo}>Acceso al Panel</h1>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoFocus
          required
        />
        <button type="submit" disabled={cargando} style={styles.boton}>
          {cargando ? 'Verificando...' : 'Entrar'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    fontFamily: 'system-ui, sans-serif',
  },
  tarjeta: {
    background: '#1e293b',
    padding: '2.5rem',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  titulo: { color: '#fff', fontSize: '1.3rem', textAlign: 'center', margin: 0 },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  boton: {
    background: '#22c55e',
    color: '#0f172a',
    fontWeight: 700,
    padding: '0.8rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
  },
  error: { color: '#f87171', fontSize: '0.85rem', textAlign: 'center', margin: 0 },
};
