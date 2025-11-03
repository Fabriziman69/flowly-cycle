// Importar el cliente de Supabase
import { supabase } from './client.js'
import { actualizarMetricasUsuario } from './users.js'

/**
 * Crea un nuevo ciclo menstrual para un usuario
 * @param {string} usuarioId - ID del usuario
 * @param {string} fechaInicio - Fecha de inicio del ciclo (formato YYYY-MM-DD)
 * @param {number} duracion - Duración del ciclo en días
 * @returns {Object} Objeto con `data` (ciclo creado) y `error` (si hay error)
 */
export async function crearCiclo(usuarioId, fechaInicio, duracion) {
  try {
    // Calcular la fecha de fin del ciclo (fechaInicio + duración - 1 día)
    const fechaFin = new Date(fechaInicio)
    fechaFin.setDate(fechaFin.getDate() + duracion - 1)

    const { data, error } = await supabase
      .from('Ciclo')
      .insert([
        {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin.toISOString().split('T')[0],
          duracion: duracion,
          fk_usuario: usuarioId
        }
      ])
      .select()

    if (error) throw error

    // Actualizar las métricas del usuario con la duración del ciclo
    await actualizarMetricasUsuario(usuarioId, duracion)
    
    return { data, error: null }
  } catch (error) {
    console.error('Error en crearCiclo:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene el ciclo actual (activo) del usuario
 * @param {string} usuarioId - ID del usuario
 * @returns {Object} Objeto con `data` (ciclo actual) y `error` (si hay error)
 */
export async function obtenerCicloActual(usuarioId) {
  try {
    const { data, error } = await supabase
      .from('Ciclo')
      .select('*')
      .eq('fk_usuario', usuarioId)
      .is('fecha_fin', null)  // Ciclo actual no tiene fecha_fin
      .single()

    // Si no se encuentra el ciclo, no es un error, devuelve null
    if (error && error.code !== 'PGRST116') throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerCicloActual:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene el historial de ciclos del usuario (ciclos finalizados)
 * @param {string} usuarioId - ID del usuario
 * @param {number} limite - Número máximo de ciclos a obtener (por defecto 12)
 * @returns {Object} Objeto con `data` (array de ciclos) y `error` (si hay error)
 */
export async function obtenerHistorialCiclos(usuarioId, limite = 12) {
  try {
    const { data, error } = await supabase
      .from('Ciclo')
      .select('*')
      .eq('fk_usuario', usuarioId)
      .not('fecha_fin', 'is', null)  // Solo ciclos finalizados
      .order('fecha_inicio', { ascending: false })
      .limit(limite)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerHistorialCiclos:', error)
    return { data: null, error }
  }
}

/**
 * Finaliza un ciclo actual estableciendo su fecha_fin
 * @param {number} cicloId - ID del ciclo a finalizar
 * @param {string} fechaFin - Fecha de fin del ciclo (formato YYYY-MM-DD)
 * @returns {Object} Objeto con `data` (ciclo actualizado) y `error` (si hay error)
 */
export async function finalizarCiclo(cicloId, fechaFin) {
  try {
    const { data, error } = await supabase
      .from('Ciclo')
      .update({ fecha_fin: fechaFin })
      .eq('id_ciclo', cicloId)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en finalizarCiclo:', error)
    return { data: null, error }
  }
}