// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

type Registro = {
  id: string;
  tipo: 'ENTRADA' | 'SALIDA';
  marcado_en: string;
  dni: string;
  nombre_completo: string;
  area: string | null;
};

function hoyISO() {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

export default function DashboardPage() {
  const [fecha, setFecha] = useState(hoyISO());
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarRegistros = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`/api/registros?fecha=${fecha}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setRegistros(data.registros);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargarRegistros();
    // Auto-refresco cada 15 segundos para simular "tiempo real"
    const interval = setInterval(cargarRegistros, 15000);
    return () => clearInterval(interval);
  }, [cargarRegistros]);

  return (
    <div style={styles.contenedor}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Panel de Asistencia</h1>
        <a 
          href="/admin/trabajadores" 
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-4"
        >
          + Registrar Nuevo Trabajador
        </a>
        
        <a 
          href="/admin/gestion" 
          className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition mb-4 ml-2"
        >
          ⚙️ Gestionar Trabajadores
        </a>
        <div style={styles.controles}>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={styles.inputFecha}
          />
          <button onClick={cargarRegistros} style={styles.botonRefrescar}>
            Refrescar
          </button>
        </div>
      </div>

      {error && <div style={styles.avisoError}>{error}</div>}

      {cargando && registros.length === 0 ? (
        <p style={styles.textoInfo}>Cargando registros...</p>
      ) : registros.length === 0 ? (
        <p style={styles.textoInfo}>No hay registros para esta fecha.</p>
      ) : (
        <div style={styles.tablaWrapper}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>Trabajador</th>
                <th style={styles.th}>DNI</th>
                <th style={styles.th}>Área</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>{r.nombre_completo}</td>
                  <td style={styles.td}>{r.dni}</td>
                  <td style={styles.td}>{r.area || '—'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(r.tipo === 'ENTRADA'
                          ? styles.badgeEntrada
                          : styles.badgeSalida),
                      }}
                    >
                      {r.tipo}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(r.marcado_en).toLocaleTimeString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  contenedor: {
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: 'system-ui, sans-serif',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  titulo: { color: '#fff', fontSize: '1.5rem', margin: 0 },
  controles: { display: 'flex', gap: '0.75rem' },
  inputFecha: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    color: '#fff',
  },
  botonRefrescar: {
    background: '#22c55e',
    color: '#0f172a',
    fontWeight: 700,
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  textoInfo: { color: '#94a3b8' },
  avisoError: {
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  tablaWrapper: {
    background: '#1e293b',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    color: '#94a3b8',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    borderBottom: '1px solid #334155',
  },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.9rem' },
  badge: {
    padding: '0.25rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  badgeEntrada: { background: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  badgeSalida: { background: 'rgba(239,68,68,0.15)', color: '#f87171' },
  
};