// Importar el cliente de Supabase
import { supabase } from './client.js'
import { obtenerCicloActual } from './cycles.js'

/**
 * Guarda un registro diario (inserta o actualiza si ya existe para la fecha)
 * @param {Object} registro - Objeto con los datos del registro diario
 * @param {string} registro.fk_usuario - ID del usuario
 * @param {string} registro.fecha_actual - Fecha del registro (YYYY-MM-DD)
 * @param {string} registro.nota_extra - Notas adicionales
 * @param {number} registro.temperatura_basal - Temperatura basal
 * @param {string} registro.flujo_cervical - Tipo de flujo (enum: SECO, PEGAJOSO, etc.)
 * @param {Array} registro.sintomas - Array de síntomas (opcional)
 * @returns {Object} Objeto con `data` (registro guardado) y `error` (si hay error)
 */
export async function guardarRegistroDiario(registro) {
  try {
    // Obtener el ciclo actual del usuario
    const { data: ciclo } = await obtenerCicloActual(registro.fk_usuario)
    
    if (!ciclo) {
      throw new Error('No se encontró un ciclo activo para el usuario')
    }

    // Verificar si ya existe un registro para esta fecha en el ciclo actual
    const { data: registroExistente } = await supabase
      .from('Registro_diario')
      .select('id_registro_diario')
      .eq('fecha_actual', registro.fecha_actual)
      .eq('fk_ciclo', ciclo.id_ciclo)
      .single()

    let resultado

    if (registroExistente) {
      // Actualizar registro existente
      resultado = await supabase
        .from('Registro_diario')
        .update({
          nota_extra: registro.nota_extra,
          temperatura_basal: registro.temperatura_basal,
          flujo_cervical: registro.flujo_cervical
        })
        .eq('id_registro_diario', registroExistente.id_registro_diario)
        .select()
    } else {
      // Crear nuevo registro
      resultado = await supabase
        .from('Registro_diario')
        .insert([
          {
            fecha_actual: registro.fecha_actual,
            nota_extra: registro.nota_extra,
            temperatura_basal: registro.temperatura_basal,
            flujo_cervical: registro.flujo_cervical,
            fk_ciclo: ciclo.id_ciclo
          }
        ])
        .select()
    }

    if (resultado.error) throw resultado.error

    // Si se proporcionaron síntomas, guardarlos
    if (registro.sintomas && registro.sintomas.length > 0) {
      await guardarSintomasRegistro(resultado.data[0].id_registro_diario, registro.sintomas)
    }

    return { data: resultado.data, error: null }
  } catch (error) {
    console.error('Error en guardarRegistroDiario:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los registros diarios de un usuario en un rango de fechas
 * @param {string} usuarioId - ID del usuario
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 * @returns {Object} Objeto con `data` (array de registros) y `error` (si hay error)
 */
export async function obtenerRegistrosDiarios(usuarioId, fechaInicio, fechaFin) {
  try {
    const { data, error } = await supabase
      .from('Registro_diario')
      .select(`
        *,
        Ciclo!inner (
          fk_usuario
        ),
        registro-sintoma (
          intensidad,
          Sintomas (
            nombre_sintoma,
            categoria
          )
        )
      `)
      .eq('Ciclo.fk_usuario', usuarioId)
      .gte('fecha_actual', fechaInicio)
      .lte('fecha_actual', fechaFin)
      .order('fecha_actual', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerRegistrosDiarios:', error)
    return { data: null, error }
  }
}

/**
 * Guarda los síntomas asociados a un registro diario
 * @param {number} registroDiarioId - ID del registro diario
 * @param {Array} sintomas - Array de objetos con `id_sintoma` e `intensidad`
 */
async function guardarSintomasRegistro(registroDiarioId, sintomas) {
  try {
    // Primero, eliminar síntomas existentes para este registro
    await supabase
      .from('registro-sintoma')
      .delete()
      .eq('fk_registro_diario', registroDiarioId)

    // Preparar datos para insertar
    const sintomasData = sintomas.map(sintoma => ({
      fk_registro_diario: registroDiarioId,
      fk_sintomas: sintoma.id_sintoma,
      intensidad: sintoma.intensidad
    }))

    // Insertar nuevos síntomas
    const { error } = await supabase
      .from('registro-sintoma')
      .insert(sintomasData)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error en guardarSintomasRegistro:', error)
    return { error }
  }
}

export function suscribirARegistrosDiarios(usuarioId, callback) {
  return supabase
    .channel('registros-diarios')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Registro_diario',
        filter: `fk_usuario=eq.${usuarioId}`
      },
      callback
    )
    .subscribe()
}