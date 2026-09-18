'use client';

import { useState, useEffect } from 'react';

type Trabajador = {
  id: string;
  dni: string;
  nombre_completo: string;
  area: string | null;
};

export default function GestionTrabajadores() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [dniSeleccionado, setDniSeleccionado] = useState('');
  const [nuevoPin, setNuevoPin] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState('');

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch('/api/gestion');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setTrabajadores(data.trabajadores);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const handleResetPin = async (dni: string) => {
    setMensaje('');
    setError('');
    
    if (nuevoPin.length !== 4 || !/^\d+$/.test(nuevoPin)) {
      setError('El PIN debe tener exactamente 4 dígitos numéricos');
      return;
    }

    try {
      const res = await fetch('/api/gestion/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, nuevoPin }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMensaje(`✅ PIN actualizado para ${dni}`);
        setDniSeleccionado('');
        setNuevoPin('');
        setMostrarFormulario('');
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      setError('❌ Error de conexión con el servidor');
    }
  };

  return (
    <div style={styles.contenedor}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Gestión de Trabajadores</h1>
        <div style={styles.botones}>
          <a href="/admin/trabajadores" style={styles.botonSecundario}>
            + Registrar Nuevo
          </a>
          <a href="/dashboard" style={styles.botonSecundario}>
            ← Volver al Dashboard
          </a>
        </div>
      </div>

      {error && <div style={styles.avisoError}>{error}</div>}
      {mensaje && <div style={styles.avisoExito}>{mensaje}</div>}

      {cargando ? (
        <p style={styles.textoInfo}>Cargando trabajadores...</p>
      ) : trabajadores.length === 0 ? (
        <p style={styles.textoInfo}>No hay trabajadores registrados.</p>
      ) : (
        <div style={styles.tablaWrapper}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>DNI</th>
                <th style={styles.th}>Área</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trabajadores.map((t) => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>{t.nombre_completo}</td>
                  <td style={styles.td}>{t.dni}</td>
                  <td style={styles.td}>{t.area || '—'}</td>
                  <td style={styles.td}>
                    {mostrarFormulario === t.dni ? (
                      <div style={styles.formularioPin}>
                        <input
                          type="password"
                          value={nuevoPin}
                          onChange={(e) => setNuevoPin(e.target.value)}
                          placeholder="Nuevo PIN (4 dígitos)"
                          maxLength={4}
                          style={styles.inputPin}
                        />
                        <button
                          onClick={() => handleResetPin(t.dni)}
                          style={styles.botonGuardar}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setMostrarFormulario('');
                            setNuevoPin('');
                          }}
                          style={styles.botonCancelar}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setDniSeleccionado(t.dni);
                          setMostrarFormulario(t.dni);
                          setNuevoPin('');
                        }}
                        style={styles.botonReset}
                      >
                        Cambiar PIN
                      </button>
                    )}
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
  botones: { display: 'flex', gap: '0.75rem' },
  botonSecundario: {
    background: '#475569',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  textoInfo: { color: '#94a3b8' },
  avisoError: {
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  avisoExito: {
    background: 'rgba(34,197,94,0.15)',
    color: '#4ade80',
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
  formularioPin: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  inputPin: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    color: '#fff',
    width: '120px',
  },
  botonGuardar: {
    background: '#22c55e',
    color: '#0f172a',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  botonCancelar: {
    background: '#64748b',
    color: '#fff',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  botonReset: {
    background: '#f59e0b',
    color: '#0f172a',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
};
