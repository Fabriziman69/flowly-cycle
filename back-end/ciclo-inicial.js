// Importar funciones necesarias
import { obtenerUsuarioActual } from './autenticacion.js'
import { crearCiclo } from './cycles.js'
import { obtenerFraseMotivacional } from './frases.js'

/**
 * Inicializa el formulario de ciclo inicial agregando el event listener
 */
export function inicializarFormularioCicloInicial() {
  const formulario = document.getElementById('formRegistroInicial')
  
  if (!formulario) {
    console.error('No se encontró el formulario de ciclo inicial')
    return
  }

  formulario.addEventListener('submit', async (event) => {
    event.preventDefault()
    
    const ultimoPeriodo = document.getElementById('ultimoPeriodo').value
    const duracionCiclo = parseInt(document.getElementById('duracionCiclo').value)
    
    await guardarConfiguracionInicial(ultimoPeriodo, duracionCiclo)
  })
}

/**
 * Guarda la configuración inicial del ciclo menstrual
 * @param {string} fechaInicio - Fecha del último período (YYYY-MM-DD)
 * @param {number} duracionCiclo - Duración del ciclo en días
 */
async function guardarConfiguracionInicial(fechaInicio, duracionCiclo) {
  try {
    // Obtener el usuario actual (debe estar disponible en el contexto de la aplicación)
    const usuario = await obtenerUsuarioActual() // Esta función debe ser proporcionada por la aplicación principal
    
    if (!usuario) {
      mostrarError('No hay usuario autenticado')
      return
    }

    // Guardar el ciclo en la base de datos
    const { data, error } = await crearCiclo(usuario.id, fechaInicio, duracionCiclo)
    
    if (error) {
      mostrarError('Error al guardar configuración: ' + error.message)
      return
    }

    // Obtener una frase motivacional para el tipo CICLO
    const { data: frase } = await obtenerFraseMotivacional('CICLO')
    
    // Mostrar mensaje de éxito con la frase motivacional si está disponible
    if (frase) {
      mostrarExito('¡Configuración guardada! ' + frase.frases)
    } else {
      mostrarExito('¡Configuración guardada exitosamente!')
    }

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroInicial'))
    modal.hide()
    
    // Actualizar la interfaz de la aplicación
    if (typeof actualizarInterfaz === 'function') {
      actualizarInterfaz()
    }
    
  } catch (error) {
    mostrarError('Error inesperado: ' + error.message)
  }
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
  console.error('Error:', mensaje)
  alert('Error: ' + mensaje) // Reemplazar con tu sistema de notificaciones
}

/**
 * Muestra un mensaje de éxito
 * @param {string} mensaje - Mensaje de éxito a mostrar
 */
function mostrarExito(mensaje) {
  console.log('Éxito:', mensaje)
  alert('Éxito: ' + mensaje) // Reemplazar con tu sistema de notificaciones
}

