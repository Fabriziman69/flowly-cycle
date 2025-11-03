// Importar módulos necesarios
import { supabase, verificarConexion } from './client.js'
import { obtenerUsuarioActual as obtenerUsuarioAuth } from './autenticacion.js'
import { inicializarFormularioLogin } from './login-form.js'
import { inicializarFormularioCicloInicial } from './ciclo-inicial.js'
import { inicializarFormularioRegistroDiario } from './daily-registration.js'
import { 
  inicializarCalendario, 
  configurarNavegacion, 
  crearParticulas, 
  configurarEventosRegistro,
  actualizarCalendario,
  actualizarEstadisticas 
} from './utils.js'
import { obtenerCicloActual } from './cycles.js'
import { obtenerRegistrosDiarios, suscribirARegistrosDiarios } from './registro.js'

// Variables globales de la aplicación
let usuarioActual = null
let datosUsuario = {
  cicloConfigurado: false,
  registrosDiarios: []
}

/**
 * Función principal que inicializa la aplicación
 */
document.addEventListener('DOMContentLoaded', async function() {
  await inicializarAplicacion()
})

/**
 * Inicializa todos los componentes de la aplicación
 */
async function inicializarAplicacion() {
  // Verificar conexión a Supabase
  const { conectado } = await verificarConexion()
  if (!conectado) {
    mostrarError('No se pudo conectar a la base de datos. Verifica tu conexión a internet.')
    return
  }

  // Inicializar formularios
  inicializarFormularioLogin()
  inicializarFormularioCicloInicial()
  inicializarFormularioRegistroDiario()

  // Verificar si el usuario está autenticado
  usuarioActual = await obtenerUsuarioAuth()
  
  if (usuarioActual) {
    // Usuario autenticado - cargar sus datos y configurar interfaz
    await cargarDatosUsuario()
    configurarInterfazAutenticada()
  } else {
    // Usuario no autenticado - mostrar formulario de login
    configurarInterfazNoAutenticada()
  }

  // Inicializar otros componentes de la aplicación
  inicializarCalendario()
  configurarNavegacion()
  crearParticulas()
  configurarEventosRegistro()
}

/**
 * Carga los datos del usuario desde Supabase
 */
async function cargarDatosUsuario() {
  if (!usuarioActual) return
  
  try {
    // Cargar ciclo actual del usuario
    const { data: ciclo } = await obtenerCicloActual(usuarioActual.id)
    
    if (ciclo) {
      datosUsuario.cicloConfigurado = true
      datosUsuario.ultimoPeriodo = ciclo.fecha_inicio
      datosUsuario.duracionCiclo = ciclo.duracion
    }
    
    // Cargar registros del último mes
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - 1)
    
    const { data: registros } = await obtenerRegistrosDiarios(
      usuarioActual.id,
      fechaInicio.toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    )
    
    if (registros) {
      datosUsuario.registrosDiarios = registros
    }
    
    // Suscribirse a cambios en tiempo real en los registros
    suscribirARegistrosDiarios(usuarioActual.id, (payload) => {
      console.log('Cambio en registros:', payload)
      actualizarInterfaz()
    })
    
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
  }
}

/**
 * Configura la interfaz para usuarios autenticados
 */
function configurarInterfazAutenticada() {
  // Mostrar contenido principal
  document.getElementById('contenido-principal').classList.remove('d-none')
  document.getElementById('formulario-login').classList.add('d-none')
  
  // Actualizar nombre de usuario en la interfaz
  const elementoNombreUsuario = document.getElementById('nombre-usuario')
  if (elementoNombreUsuario) {
    elementoNombreUsuario.textContent = usuarioActual.email
  }
  
  actualizarInterfaz()
}

/**
 * Configura la interfaz para usuarios no autenticados
 */
function configurarInterfazNoAutenticada() {
  // Mostrar formulario de login/registro
  document.getElementById('contenido-principal').classList.add('d-none')
  document.getElementById('formulario-login').classList.remove('d-none')
}

/**
 * Actualiza la interfaz de usuario según el estado actual
 */
function actualizarInterfaz() {
  // Actualizar texto del botón de registro
  const textoRegistro = document.getElementById('registro-texto')
  if (textoRegistro) {
    textoRegistro.textContent = datosUsuario.cicloConfigurado ? 'Registro Diario' : 'Registro'
  }
  
  // Actualizar calendario
  actualizarCalendario()
  
  // Actualizar estadísticas si es necesario
  if (document.getElementById('seccion-estadisticas').classList.contains('active')) {
    actualizarEstadisticas()
  }
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(mensaje) {
  // Implementar tu sistema de notificaciones
  console.error('Error:', mensaje)
  alert('Error: ' + mensaje)
}

/**
 * Muestra un mensaje de éxito
 */
function mostrarExito(mensaje) {
  // Implementar tu sistema de notificaciones
  console.log('Éxito:', mensaje)
  alert('Éxito: ' + mensaje)
}

// Exportar variables y funciones necesarias para otros módulos
export { usuarioActual, datosUsuario }

/**
 * Función auxiliar para obtener el usuario actual (para usar en otros módulos)
 */
export function obtenerUsuarioActual() {
  return usuarioActual
}

