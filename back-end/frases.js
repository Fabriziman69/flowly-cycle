// Importar el cliente de Supabase
import { supabase } from './client.js'

/**
 * Obtiene una frase motivacional aleatoria del tipo especificado
 * @param {string} tipo - Tipo de frase (GENERAL, CICLO, FERTILIDAD, ANIMO_BAJO)
 * @returns {Object} Objeto con `data` (frase) y `error` (si hay error)
 */
export async function obtenerFraseMotivacional(tipo = 'GENERAL') {
  try {
    // Obtener todas las frases del tipo especificado
    const { data, error } = await supabase
      .from('Frases_motivacionales')
      .select('*')
      .eq('tipo_de_frase', tipo)

    if (error) throw error

    // Si hay frases, seleccionar una aleatoria
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      return { data: data[randomIndex], error: null }
    } else {
      return { data: null, error: 'No hay frases disponibles' }
    }
  } catch (error) {
    console.error('Error en obtenerFraseMotivacional:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene todas las frases de un tipo específico
 * @param {string} tipo - Tipo de frase (GENERAL, CICLO, FERTILIDAD, ANIMO_BAJO)
 * @returns {Object} Objeto con `data` (array de frases) y `error` (si hay error)
 */
export async function obtenerTodasFrasesPorTipo(tipo) {
  try {
    const { data, error } = await supabase
      .from('Frases_motivacionales')
      .select('*')
      .eq('tipo_de_frase', tipo)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerTodasFrasesPorTipo:', error)
    return { data: null, error }
  }
}