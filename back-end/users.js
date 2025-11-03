// Importar el cliente de Supabase
import { supabase } from './client.js'

/**
 * Obtiene el perfil completo del usuario desde la tabla Usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Objeto con `data` (perfil del usuario) y `error` (si hay error)
 */
export async function obtenerPerfilUsuario(userId) {
  try {
    const { data, error } = await supabase
      .from('Usuario')
      .select('*')
      .eq('id_usuario', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerPerfilUsuario:', error)
    return { data: null, error }
  }
}

/**
 * Actualiza el perfil del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} datosActualizados - Objeto con los campos a actualizar
 * @returns {Object} Objeto con `data` (perfil actualizado) y `error` (si hay error)
 */
export async function actualizarPerfilUsuario(userId, datosActualizados) {
  try {
    const { data, error } = await supabase
      .from('Usuario')
      .update(datosActualizados)
      .eq('id_usuario', userId)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en actualizarPerfilUsuario:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las métricas del usuario desde la tabla Metricas
 * @param {string} userId - ID del usuario
 * @returns {Object} Objeto con `data` (métricas del usuario) y `error` (si hay error)
 */
export async function obtenerMetricasUsuario(userId) {
  try {
    const { data, error } = await supabase
      .from('Metricas')
      .select('*')
      .eq('fk_usuario', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerMetricasUsuario:', error)
    return { data: null, error }
  }
}

/**
 * Actualiza las métricas del usuario (ciclo promedio y regularidad)
 * @param {string} userId - ID del usuario
 * @param {number} duracionCiclo - Duración del ciclo en días
 * @returns {Object} Objeto con `data` (métricas actualizadas) y `error` (si hay error)
 */
export async function actualizarMetricasUsuario(userId, duracionCiclo) {
  try {
    // Calcular regularidad (consideramos regular si la duración está entre 26-32 días)
    const regularidad = duracionCiclo >= 26 && duracionCiclo <= 32

    const { data, error } = await supabase
      .from('Metricas')
      .upsert([
        {
          fk_usuario: userId,
          ciclo_promedio: duracionCiclo,
          regularidad: regularidad
        }
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en actualizarMetricasUsuario:', error)
    return { data: null, error }
  }
}