// Importar funciones necesarias
import { guardarRegistroDiario } from './registro.js'
import { obtenerSintomasDisponibles } from './sintomas.js'

/**
 * Inicializa el formulario de registro diario
 */
export function inicializarFormularioRegistroDiario() {
  const formulario = document.getElementById('formRegistroDiario')
  
  if (!formulario) {
    console.error('No se encontró el formulario de registro diario')
    return
  }

  // Cargar síntomas disponibles cuando se abra el modal
  document.getElementById('modalRegistroDiario').addEventListener('show.bs.modal', cargarSintomasDisponibles)

  // Manejar el envío del formulario
  formulario.addEventListener('submit', async (event) => {
    event.preventDefault()
    await guardarRegistroDiarioHandler()
  })
}

/**
 * Carga los síntomas disponibles desde la base de datos
 */
async function cargarSintomasDisponibles() {
  try {
    const { data: sintomas, error } = await obtenerSintomasDisponibles()
    
    if (error) {
      console.error('Error al cargar síntomas:', error)
      return
    }
    
    // Aquí puedes poblar un select o lista de síntomas en la interfaz si es necesario
    console.log('Síntomas disponibles:', sintomas)
    
  } catch (error) {
    console.error('Error inesperado al cargar síntomas:', error)
  }
}

/**
 * Maneja el guardado del registro diario
 */
async function guardarRegistroDiarioHandler() {
  try {
    // Obtener el usuario actual (debe estar disponible en el contexto de la aplicación)
    const usuario = await obtenerUsuarioActual() // Esta función debe ser proporcionada por la aplicación principal
    
    if (!usuario) {
      mostrarError('No hay usuario autenticado')
      return
    }

    // Obtener los valores del formulario
    const fechaActual = new Date().toISOString().split('T')[0]
    const sintomas = document.getElementById('sintomas').value
    const sintomaEspecifico = document.getElementById('sintomaEspecifico').value
    const intensidadSintomas = document.getElementById('intensidadSintomas').value
    const flujo = document.getElementById('flujo').value
    const notas = document.getElementById('notas').value
    const temperatura = document.getElementById('temperatura').value

    // Obtener categorías seleccionadas
    const categoriasCheckboxes = document.querySelectorAll('.categorias-sintomas input[type="checkbox"]:checked')
    const categoriasSintomas = Array.from(categoriasCheckboxes).map(cb => cb.value)

    // Preparar datos para la base de datos
    const registroData = {
      fecha_actual: fechaActual,
      nota_extra: notas,
      temperatura_basal: temperatura ? parseFloat(temperatura) : null,
      flujo_cervical: flujo || null,
      fk_usuario: usuario.id,
      sintomas: [] // Aquí procesarías los síntomas específicos si los hay
    }

    // Guardar en la base de datos
    const { data, error } = await guardarRegistroDiario(registroData)
    
    if (error) {
      mostrarError('Error al guardar registro: ' + error.message)
      return
    }

    mostrarExito('Registro diario guardado exitosamente.')

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroDiario'))
    modal.hide()
    
    // Limpiar el formulario
    document.getElementById('formRegistroDiario').reset()
    
    // Actualizar la interfaz
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