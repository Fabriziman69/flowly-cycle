// Importar el cliente de Supabase
import { supabase } from './client.js'

/**
 * Crea una nueva notificación para el usuario
 * @param {string} usuarioId - ID del usuario
 * @param {string} mensaje - Mensaje de la notificación
 * @param {string} tipo - Tipo de notificación (PERIODO, FERTILIDAD, RECORDATORIO)
 * @param {string} fechaProgramada - Fecha programada para la notificación (formato ISO)
 * @returns {Object} Objeto con `data` (notificación creada) y `error` (si hay error)
 */
export async function crearNotificacion(usuarioId, mensaje, tipo, fechaProgramada) {
  try {
    const { data, error } = await supabase
      .from('Notificaciones')
      .insert([
        {
          mensaje: mensaje,
          tipo_notificacion: tipo,
          fecha_programada: fechaProgramada,
          estado: 'PENDIENTE',
          fk_usuario: usuarioId
        }
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en crearNotificacion:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las notificaciones pendientes del usuario que están programadas para ahora o antes
 * @param {string} usuarioId - ID del usuario
 * @returns {Object} Objeto con `data` (array de notificaciones) y `error` (si hay error)
 */
export async function obtenerNotificacionesPendientes(usuarioId) {
  try {
    const { data, error } = await supabase
      .from('Notificaciones')
      .select('*')
      .eq('fk_usuario', usuarioId)
      .eq('estado', 'PENDIENTE')
      .lte('fecha_programada', new Date().toISOString())
      .order('fecha_programada')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerNotificacionesPendientes:', error)
    return { data: null, error }
  }
}

/**
 * Marca una notificación como enviada
 * @param {number} notificacionId - ID de la notificación
 * @returns {Object} Objeto con `error` (si hay error)
 */
export async function marcarNotificacionEnviada(notificacionId) {
  try {
    const { error } = await supabase
      .from('Notificaciones')
      .update({ 
        estado: 'ENVIADA', 
        fecha_enviada: new Date().toISOString() 
      })
      .eq('id_notificacion', notificacionId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error en marcarNotificacionEnviada:', error)
    return { error }
  }
}

/**
 * Marca una notificación como leída
 * @param {number} notificacionId - ID de la notificación
 * @returns {Object} Objeto con `error` (si hay error)
 */
export async function marcarNotificacionLeida(notificacionId) {
  try {
    const { error } = await supabase
      .from('Notificaciones')
      .update({ estado: 'LEIDA' })
      .eq('id_notificacion', notificacionId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error en marcarNotificacionLeida:', error)
    return { error }
  }
}