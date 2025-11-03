// client.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env
dotenv.config();

// Crear cliente de Supabase usando las variables de entorno
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Exportar el cliente para usarlo en otros módulos
export { supabase };

/**
 * Verifica la conexión con la base de datos Supabase
 * @returns {Object} Objeto con la propiedad `conectado` (boolean) y `error` (si hay error)
 */
export async function verificarConexion() {
  try {
    console.log("🔌 Verificando conexión a Supabase...");

    // Intentar leer una tabla existente (ajusta el nombre a tu tabla real, ej: "Usuario")
    const { data, error } = await supabase.from("Usuario").select("count").limit(1);

    if (error) {
      console.error("❌ Error de conexión:", error.message);
      return { conectado: false, error };
    }

    console.log("✅ Conexión a Supabase exitosa");
    return { conectado: true, error: null };
  } catch (error) {
    console.error("❌ Error inesperado:", error.message);
    return { conectado: false, error };
  }
}


