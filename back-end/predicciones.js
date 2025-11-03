// Importar el cliente de Supabase
import { supabase } from './client.js'
import { obtenerCicloActual, obtenerHistorialCiclos } from './cycles.js'

/**
 * Genera predicciones para el usuario basadas en su ciclo actual e historial
 * @param {string} usuarioId - ID del usuario
 * @returns {Object} Objeto con `error` (si hay error)
 */
export async function generarPredicciones(usuarioId) {
  try {
    // Obtener el ciclo actual del usuario
    const { data: ciclo } = await obtenerCicloActual(usuarioId)
    if (!ciclo) return

    // Obtener historial de ciclos para calcular promedios
    const { data: historial } = await obtenerHistorialCiclos(usuarioId, 6)
    
    // Combinar ciclo actual con historial para cálculos
    const ciclos = historial ? [ciclo, ...historial] : [ciclo]
    const duracionPromedio = Math.round(
      ciclos.reduce((sum, c) => sum + c.duracion, 0) / ciclos.length
    )

    const fechaInicio = new Date(ciclo.fecha_inicio)
    const fechaFinCiclo = new Date(fechaInicio)
    fechaFinCiclo.setDate(fechaInicio.getDate() + duracionPromedio)

    // Calcular fecha de ovulación (aproximadamente día 14)
    const fechaOvulacion = new Date(fechaInicio)
    fechaOvulacion.setDate(fechaInicio.getDate() + 14)

    // Calcular ventana fértil (5 días antes de la ovulación y 1 día después)
    const fechaFertilidadInicio = new Date(fechaOvulacion)
    fechaFertilidadInicio.setDate(fechaOvulacion.getDate() - 5)

    const fechaFertilidadFin = new Date(fechaOvulacion)
    fechaFertilidadFin.setDate(fechaOvulacion.getDate() + 1)

    // Calcular período de SPM (síndrome premenstrual) - 7 días antes del fin del ciclo
    const fechaSPMInicio = new Date(fechaFinCiclo)
    fechaSPMInicio.setDate(fechaFinCiclo.getDate() - 7)

    // Crear array de predicciones
    const predicciones = [
      {
        tipo_de_prediccion: 'PERIODO',
        fecha_de_inicio: fechaFinCiclo.toISOString().split('T')[0],
        fecha_de_fin: new Date(fechaFinCiclo.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confianza: 85,
        fk_usuario: usuarioId
      },
      {
        tipo_de_prediccion: 'OVULACION',
        fecha_de_inicio: fechaOvulacion.toISOString().split('T')[0],
        fecha_de_fin: fechaOvulacion.toISOString().split('T')[0],
        confianza: 70,
        fk_usuario: usuarioId
      },
      {
        tipo_de_prediccion: 'FERTILIDAD',
        fecha_de_inicio: fechaFertilidadInicio.toISOString().split('T')[0],
        fecha_de_fin: fechaFertilidadFin.toISOString().split('T')[0],
        confianza: 75,
        fk_usuario: usuarioId
      },
      {
        tipo_de_prediccion: 'SPM',
        fecha_de_inicio: fechaSPMInicio.toISOString().split('T')[0],
        fecha_de_fin: fechaFinCiclo.toISOString().split('T')[0],
        confianza: 65,
        fk_usuario: usuarioId
      }
    ]

    // Eliminar predicciones antiguas del usuario
    await supabase
      .from('Predicciones')
      .delete()
      .eq('fk_usuario', usuarioId)

    // Insertar nuevas predicciones
    const { error } = await supabase
      .from('Predicciones')
      .insert(predicciones)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error en generarPredicciones:', error)
    return { error }
  }
}

/**
 * Obtiene las predicciones actuales del usuario
 * @param {string} usuarioId - ID del usuario
 * @returns {Object} Objeto con `data` (array de predicciones) y `error` (si hay error)
 */
export async function obtenerPrediccionesUsuario(usuarioId) {
  try {
    const { data, error } = await supabase
      .from('Predicciones')
      .select('*')
      .eq('fk_usuario', usuarioId)
      .gte('fecha_de_fin', new Date().toISOString().split('T')[0])  // Solo predicciones futuras
      .order('fecha_de_inicio')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en obtenerPrediccionesUsuario:', error)
    return { data: null, error }
  }
}