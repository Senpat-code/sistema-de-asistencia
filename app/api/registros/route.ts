// app/api/registros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha'); // formato YYYY-MM-DD

    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         r.id,
         r.tipo,
         r.marcado_en,
         u.dni,
         u.nombre_completo,
         u.area
       FROM registros_asistencia r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE (r.marcado_en AT TIME ZONE 'America/Lima')::date = $1::date
       ORDER BY r.marcado_en DESC`,
      [fechaFiltro]
    );

    return NextResponse.json({ fecha: fechaFiltro, registros: rows });
  } catch (error) {
    console.error('Error en /api/registros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}