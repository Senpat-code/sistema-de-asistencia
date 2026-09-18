import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { nombre, dni, pin, area } = await req.json();

    // Validar campos requeridos
    if (!nombre || !dni || !pin || !area) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Validar que el PIN tenga 4 dígitos
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'El PIN debe tener exactamente 4 dígitos numéricos' }, { status: 400 });
    }

    // Validar que el DNI no exista ya
    const existe = await pool.query('SELECT id FROM trabajadores WHERE dni = $1', [dni]);
    if (existe.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un trabajador con ese DNI' }, { status: 400 });
    }

    // Insertar nuevo trabajador
    await pool.query(
      'INSERT INTO trabajadores (nombre, dni, pin, area) VALUES ($1, $2, $3, $4)',
      [nombre, dni, pin, area]
    );

    return NextResponse.json({ success: true, message: 'Trabajador registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar trabajador:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
