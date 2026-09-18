import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
    const existe = await pool.query('SELECT id FROM usuarios WHERE dni = $1', [dni]);
    if (existe.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese DNI' }, { status: 400 });
    }

    // Hashear el PIN antes de guardarlo (10 rondas de salt)
    const pinHash = await bcrypt.hash(pin, 10);

    // Insertar nuevo usuario
    await pool.query(
      'INSERT INTO usuarios (dni, nombre_completo, pin_hash, area) VALUES ($1, $2, $3, $4)',
      [dni, nombre, pinHash, area]
    );

    return NextResponse.json({ success: true, message: 'Trabajador registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar trabajador:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
