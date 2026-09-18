import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT id, dni, nombre_completo, area FROM usuarios ORDER BY nombre_completo'
    );
    return NextResponse.json({ trabajadores: result.rows });
  } catch (error) {
    console.error('Error al listar trabajadores:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
