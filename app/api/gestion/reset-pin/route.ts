import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { dni, nuevoPin } = await req.json();

    if (!dni || !nuevoPin) {
      return NextResponse.json({ error: 'DNI y nuevo PIN son requeridos' }, { status: 400 });
    }

    if (nuevoPin.length !== 4 || !/^\d+$/.test(nuevoPin)) {
      return NextResponse.json({ error: 'El PIN debe tener exactamente 4 dígitos numéricos' }, { status: 400 });
    }

    const pinHash = await bcrypt.hash(nuevoPin, 10);

    await pool.query(
      'UPDATE usuarios SET pin_hash = $1 WHERE dni = $2',
      [pinHash, dni]
    );

    return NextResponse.json({ success: true, message: 'PIN actualizado exitosamente' });
  } catch (error) {
    console.error('Error al resetear PIN:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
