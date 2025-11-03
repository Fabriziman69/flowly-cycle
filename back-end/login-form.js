// Importar funciones de autenticación
import { iniciarSesion } from './autenticacion.js'

/**
 * Inicializa el formulario de login agregando el event listener al formulario
 */
export function inicializarFormularioLogin() {
  const formularioLogin = document.getElementById('formulario-login')
  
  if (!formularioLogin) {
    console.error('No se encontró el formulario de login')
    return
  }

  formularioLogin.addEventListener('submit', async (event) => {
    event.preventDefault()
    
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    
    await manejarLogin(email, password)
  })
}

/**
 * Maneja el proceso de login
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 */
async function manejarLogin(email, password) {
  try {
    // Obtener el botón de login para mostrar estado de carga
    const botonLogin = document.getElementById('btn-login')
    const textoOriginal = botonLogin.innerHTML
    
    // Mostrar estado de carga
    botonLogin.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Iniciando sesión...'
    botonLogin.disabled = true

    // Intentar iniciar sesión
    const { data, error } = await iniciarSesion(email, password)
    
    if (error) {
      mostrarErrorLogin('Error al iniciar sesión: ' + error.message)
      // Restaurar botón
      botonLogin.innerHTML = textoOriginal
      botonLogin.disabled = false
      return
    }
    
    // Login exitoso
    mostrarExitoLogin('¡Bienvenida de nuevo!')
    
    // Recargar la aplicación después de un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1500)
    
  } catch (error) {
    mostrarErrorLogin('Error inesperado: ' + error.message)
  }
}

/**
 * Muestra un mensaje de error en el login
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarErrorLogin(mensaje) {
  // Aquí puedes implementar tu sistema de notificaciones
  console.error('Error login:', mensaje)
  alert('Error: ' + mensaje) // Reemplazar con tu sistema de notificaciones
}

/**
 * Muestra un mensaje de éxito en el login
 * @param {string} mensaje - Mensaje de éxito a mostrar
 */
function mostrarExitoLogin(mensaje) {
  // Aquí puedes implementar tu sistema de notificaciones
  console.log('Éxito login:', mensaje)
  alert('Éxito: ' + mensaje) // Reemplazar con tu sistema de notificaciones
}