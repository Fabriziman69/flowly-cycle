// Importar el cliente de Supabase
import { supabase } from './client.js'

/**
 * Registra un nuevo usuario en Supabase Auth y crea un perfil en la tabla Usuario
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} nombre - Nombre del usuario
 * @returns {Object} Objeto con `data` (datos del usuario) y `error` (si hay error)
 */
export async function registrarUsuario(email, password, nombre) {
  try {
    // Registrar el usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre,
        },
      },
    })

    if (error) throw error
    
    // Si el registro es exitoso, crear el perfil del usuario en la tabla Usuario
    if (data.user) {
      await crearPerfilUsuario(data.user.id, nombre, email)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error en registrarUsuario:', error)
    return { data: null, error }
  }
}

/**
 * Inicia sesión de usuario con email y contraseña
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object} Objeto con `data` (datos del usuario) y `error` (si hay error)
 */
export async function iniciarSesion(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en iniciarSesion:', error)
    return { data: null, error }
  }
}

/**
 * Cierra la sesión del usuario actual
 * @returns {Object} Objeto con `error` (si hay error)
 */
export async function cerrarSesion() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error en cerrarSesion:', error)
    return { error }
  }
}

/**
 * Obtiene el usuario actualmente autenticado
 * @returns {Object|null} Usuario actual o null si no hay sesión
 */
export async function obtenerUsuarioActual() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error en obtenerUsuarioActual:', error)
    return null
  }
}

/**
 * Envía un email para restablecer la contraseña
 * @param {string} email - Correo electrónico del usuario
 * @returns {Object} Objeto con `data` y `error` (si hay error)
 */
export async function restablecerContrasena(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error en restablecerContrasena:', error)
    return { data: null, error }
  }
}

/**
 * Función interna para crear el perfil del usuario en la tabla Usuario
 * @param {string} userId - ID del usuario (de Supabase Auth)
 * @param {string} nombre - Nombre del usuario
 * @param {string} email - Correo electrónico del usuario
 */
async function crearPerfilUsuario(userId, nombre, email) {
  try {
    const { data, error } = await supabase
      .from('Usuario')
      .insert([
        {
          id_usuario: userId,
          nombre: nombre,
          correo_electronico: email,
          contraseña: 'hash_protegido', // En producción, esto debe manejarse diferente
          rol: 'usuario'
        }
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear perfil de usuario:', error)
    return { data: null, error }
  }
}

