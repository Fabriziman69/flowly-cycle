// Importar el cliente de Supabase
import { supabase } from './client.js'

/**
 * Obtiene todos los síntomas disponibles en la base de datos
 * @returns {Object} Objeto con `data` (array de síntomas) y `error` (si hay error)
 */
export async function obtenerSintomasDisponibles() {
  try {
    const { data, error } = await supabase
      .from('Sintomas')
      .select('*')
      .order('categoria')
      .order('nombre_sintoma')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerSintomasDisponibles:', error)
    return { data: null, error }
  }
}

/**
 * Busca síntomas por categoría
 * @param {string} categoria - Categoría del síntoma (FISICO, EMOCIONAL, OTRO)
 * @returns {Object} Objeto con `data` (array de síntomas) y `error` (si hay error)
 */
export async function buscarSintomasPorCategoria(categoria) {
  try {
    const { data, error } = await supabase
      .from('Sintomas')
      .select('*')
      .eq('categoria', categoria)
      .order('nombre_sintoma')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en buscarSintomasPorCategoria:', error)
    return { data: null, error }
  }
}

/**
 * Crea un nuevo síntoma (solo para administradores)
 * @param {string} nombre - Nombre del síntoma
 * @param {string} categoria - Categoría del síntoma (FISICO, EMOCIONAL, OTRO)
 * @returns {Object} Objeto con `data` (síntoma creado) y `error` (si hay error)
 */
export async function crearSintoma(nombre, categoria) {
  try {
    const { data, error } = await supabase
      .from('Sintomas')
      .insert([
        {
          nombre_sintoma: nombre,
          categoria: categoria
        }
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en crearSintoma:', error)
    return { data: null, error }
  }
}