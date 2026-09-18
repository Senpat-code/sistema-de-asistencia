import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { dni, pin, tipo } = await req.json();

    if (!dni || !pin || !tipo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Buscar trabajador
    const result = await pool.query(
      'SELECT id, nombre_completo, pin_hash FROM usuarios WHERE dni = $1',
      [dni]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Trabajador no encontrado' }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const trabajador = result.rows[0];

    // Validar PIN
    const pinValido = await bcrypt.compare(pin, trabajador.pin_hash);
    if (!pinValido) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Registrar asistencia
    const registro = await pool.query(
      `INSERT INTO registros_asistencia (usuario_id, tipo, marcado_en) 
       VALUES ($1, $2, NOW()) 
       RETURNING id, tipo, marcado_en`,
      [trabajador.id, tipo]
    );

    return NextResponse.json({
      success: true,
      mensaje: `${tipo} registrada exitosamente`,
      trabajador: trabajador.nombre_completo,
      registro: registro.rows[0]
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Error al marcar asistencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

// Manejar preflight requests (OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Manejar GET (solo para debugging)
export async function GET() {
  return NextResponse.json({ 
    message: 'API de marcado de asistencia - Usa POST para marcar',
    status: 'active'
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
}
