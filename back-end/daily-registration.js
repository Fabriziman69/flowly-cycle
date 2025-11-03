/**
 * FORMULARIO DE REGISTRO DIARIO
 * 
 * Este archivo maneja:
 * - La captura de síntomas diarios del usuario
 * - El registro de temperatura basal y flujo cervical
 * - La gestión de categorías de síntomas
 * - El guardado de observaciones adicionales
 */

import { guardarRegistroDiario } from './registro.js'
import { obtenerSintomasDisponibles } from './sintomas.js'

/**
 * Inicializa el formulario de registro diario
 * 
 * USO: Preparar el formulario cuando el usuario quiere hacer un registro diario
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
 * 
 * USO: Poblar las opciones del formulario con síntomas predefinidos
 */
async function cargarSintomasDisponibles() {
  try {
    const { data: sintomas, error } = await obtenerSintomasDisponibles()
    
    if (error) {
      console.error('Error al cargar síntomas:', error)
      return
    }
    
    // Aquí puedes implementar la lógica para mostrar los síntomas en la interfaz
    console.log('Síntomas disponibles:', sintomas)
    
  } catch (error) {
    console.error('Error inesperado al cargar síntomas:', error)
  }
}

/**
 * Maneja el proceso completo de guardado del registro diario
 * 
 * USO: Procesar todos los datos cuando el usuario envía el formulario diario
 */
async function guardarRegistroDiarioHandler() {
  try {
    // Obtener el usuario actual
    const usuario = await obtenerUsuarioActual()
    
    if (!usuario) {
      mostrarError('No hay usuario autenticado')
      return
    }

    // Obtener todos los valores del formulario
    const fechaActual = new Date().toISOString().split('T')[0]
    const sintomas = document.getElementById('sintomas').value
    const sintomaEspecifico = document.getElementById('sintomaEspecifico').value
    const intensidadSintomas = document.getElementById('intensidadSintomas').value
    const flujo = document.getElementById('flujo').value
    const notas = document.getElementById('notas').value
    const temperatura = document.getElementById('temperatura').value

    // Obtener categorías de síntomas seleccionadas
    const categoriasCheckboxes = document.querySelectorAll('.categorias-sintomas input[type="checkbox"]:checked')
    const categoriasSintomas = Array.from(categoriasCheckboxes).map(cb => cb.value)

    // Preparar datos para la base de datos
    const registroData = {
      fecha_actual: fechaActual,
      nota_extra: notas,
      temperatura_basal: temperatura ? parseFloat(temperatura) : null,
      flujo_cervical: flujo || null,
      fk_usuario: usuario.id,
      sintomas: [] // Aquí procesarías los síntomas específicos
    }

    // Guardar en la base de datos
    const { data, error } = await guardarRegistroDiario(registroData)
    
    if (error) {
      mostrarError('Error al guardar registro: ' + error.message)
      return
    }

    mostrarExito('Registro diario guardado exitosamente.')

    // Cerrar el modal y limpiar el formulario
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroDiario'))
    modal.hide()
    document.getElementById('formRegistroDiario').reset()
    
    // Actualizar la interfaz de la aplicación
    if (typeof actualizarInterfaz === 'function') {
      actualizarInterfaz()
    }
    
  } catch (error) {
    mostrarError('Error inesperado: ' + error.message)
  }
}

// ===== FUNCIONES DE UTILIDAD =====

function mostrarError(mensaje) {
  console.error('Error:', mensaje)
  alert('Error: ' + mensaje)
}

function mostrarExito(mensaje) {
  console.log('Éxito:', mensaje)
  alert('Éxito: ' + mensaje)
}