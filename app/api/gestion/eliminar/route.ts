import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID del trabajador es requerido' }, { status: 400 });
    }

    // Primero verificamos que exista
    const existe = await pool.query('SELECT id FROM usuarios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return NextResponse.json({ error: 'Trabajador no encontrado' }, { status: 404 });
    }

    // Primero eliminamos los registros de asistencia asociados
    await pool.query('DELETE FROM registros_asistencia WHERE usuario_id = $1', [id]);

    // Luego eliminamos al trabajador
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Trabajador eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar trabajador:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
