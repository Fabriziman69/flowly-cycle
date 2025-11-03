// Importamos las dependencias principales
import express from "express";   // Framework para crear el servidor y manejar rutas
import cors from "cors";         // Middleware para permitir peticiones desde otros orígenes (ej. front en 5500)
import { supabase } from "./client.js"; // Cliente de Supabase ya configurado

// Inicializamos la aplicación Express
const app = express();

// Middlewares globales
app.use(cors());           // Permite que el front (localhost:5500) pueda llamar al back (localhost:3000)
app.use(express.json());   // Permite recibir y procesar datos en formato JSON en las peticiones

// ==========================
// ENDPOINT DE PRUEBA
// ==========================
app.get("/api/ping", (req, res) => {
  res.json({ message: "Servidor funcionando 🚀" });
});

// ==========================
// REGISTRO DE USUARIO
// ==========================
app.post("/api/register", async (req, res) => {
  const { email, password, username } = req.body; // Datos enviados desde el front

  // Creamos el usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Error en registro:", error);
    return res.status(400).json({ error: error.message });
  }

  // Devolvemos la respuesta de Supabase
  res.json(data);
});

// ==========================
// LOGIN DE USUARIO
// ==========================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Validamos credenciales con Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Error en login:", error.message);
    return res.status(400).json({ error: error.message });
  }

  // Devolvemos solo lo necesario: id, email y la sesión
  res.json({
    user: {
      id: data.user.id,
      email: data.user.email
    },
    session: data.session
  });
});

// ==========================
// CICLOS MENSTRUALES
// ==========================

// Obtener ciclos de un usuario (último o todos)
app.get("/api/cycles/:userId", async (req, res) => {
  const { userId } = req.params;
  const { all } = req.query;

  let query = supabase
    .from("Ciclo")
    .select("*")
    .eq("user_id", userId)
    .order("fecha_inicio", { ascending: false });

  if (!all) {
    query = query.limit(1); // Solo el más reciente
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error obteniendo ciclos:", error.message);
    return res.status(400).json({ error: error.message });
  }

  if (all) {
    res.json({ ciclos: data });
  } else {
    res.json({ ciclo: data[0] });
  }
});


// ==========================
// REGISTROS DIARIOS
// ==========================

// Guardar un registro diario
app.post("/api/records", async (req, res) => {
  const { userId, fecha, sintomas, sintomaEspecifico, categoriasSintomas, intensidadSintomas, flujo, notas, temperatura } = req.body;

  // Insertamos un nuevo registro en la tabla "Registro_diario"
  const { data, error } = await supabase
    .from("Registro_diario") // 👈 nombre exacto de tu tabla en Supabase
    .insert([{
      user_id: userId,
      fecha,
      sintomas,
      sintoma_especifico: sintomaEspecifico,
      categorias: categoriasSintomas,
      intensidad: intensidadSintomas,
      flujo,
      notas,
      temperatura
    }]);

  if (error) {
    console.error("Error guardando registro:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.json({ registro: data[0] });
});

// Obtener todos los registros de un usuario
app.get("/api/records/:userId", async (req, res) => {
  const { userId } = req.params;

  // Seleccionamos todos los registros de ese usuario ordenados por fecha
  const { data, error } = await supabase
    .from("Registro_diario")
    .select("*")
    .eq("user_id", userId)
    .order("fecha", { ascending: true });

  if (error) {
    console.error("Error obteniendo registros:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.json({ registros: data });
});

// ==========================
// INICIAR SERVIDOR
// ==========================
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});


