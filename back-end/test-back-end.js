// test-backend.js - PRUEBAS COMPLETAS
import { supabase, verificarConexion } from './client.js';
import { registrarUsuario, iniciarSesion, cerrarSesion } from './autenticacion.js';
import { crearCiclo, obtenerCicloActual, obtenerHistorialCiclos } from './cycles.js';
import { obtenerSintomasDisponibles, buscarSintomasPorCategoria } from './sintomas.js';
import { guardarRegistroDiario, obtenerRegistrosDiarios } from './registro.js';
import { generarPredicciones, obtenerPrediccionesUsuario } from './predicciones.js';
import { obtenerFraseMotivacional } from './frases.js';

class ProbadorBackend {
  constructor() {
    this.usuarioTest = null;
    this.testEmail = `test${Date.now()}@ejemplo.com`;
    this.testPassword = 'Password123!';
    this.testNombre = 'Usuario Prueba PowerShell';
  }

  async ejecutarTodasLasPruebas() {
    console.log('🚀 INICIANDO PRUEBAS COMPLETAS DEL BACKEND\n');
    console.log('📧 Email de prueba:', this.testEmail);
    console.log('🔐 Password de prueba:', this.testPassword);
    console.log('👤 Nombre de prueba:', this.testNombre);
    console.log('═'.repeat(60));

    try {
      // 1. Conexión
      await this.probarConexion();
      
      // 2. Autenticación
      await this.probarAutenticacion();
      
      // 3. Ciclos
      await this.probarCiclos();
      
      // 4. Síntomas
      await this.probarSintomas();
      
      // 5. Predicciones
      await this.probarPredicciones();
      
      // 6. Frases motivacionales
      await this.probarFrases();
      
      // 7. Limpieza
      await this.limpiezaPruebas();

      console.log('\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
      
    } catch (error) {
      console.error('\n💥 ERROR CRÍTICO:', error.message);
      process.exit(1);
    }
  }

  async probarConexion() {
    console.log('\n1. 🔌 PROBANDO CONEXIÓN A SUPABASE');
    console.log('─'.repeat(40));
    
    const { conectado, error } = await verificarConexion();
    
    if (!conectado) {
      throw new Error(`❌ Conexión fallida: ${error?.message}`);
    }
    
    console.log('✅ Conexión a Supabase exitosa');
  }

  async probarAutenticacion() {
    console.log('\n2. 🔐 PROBANDO AUTENTICACIÓN');
    console.log('─'.repeat(40));
    
    // Registrar usuario
    console.log('📝 Probando registro de usuario...');
    const { data: regData, error: regError } = await registrarUsuario(
      this.testEmail,
      this.testPassword,
      this.testNombre
    );

    if (regError && !regError.message.includes('already registered')) {
      console.log('⚠️  Registro fallido:', regError.message);
    } else {
      console.log('✅ Registro exitoso');
    }

    // Iniciar sesión
    console.log('🔑 Probando inicio de sesión...');
    const { data: loginData, error: loginError } = await iniciarSesion(
      this.testEmail,
      this.testPassword
    );

    if (loginError) {
      throw new Error(`❌ Login fallido: ${loginError.message}`);
    }

    this.usuarioTest = loginData.user;
    console.log('✅ Login exitoso. Usuario ID:', this.usuarioTest.id);
    console.log('📧 Email:', this.usuarioTest.email);
  }

  async probarCiclos() {
    if (!this.usuarioTest) throw new Error('No hay usuario para probar ciclos');
    
    console.log('\n3. 📅 PROBANDO GESTIÓN DE CICLOS');
    console.log('─'.repeat(40));
    
    // Crear ciclo
    console.log('🔄 Creando ciclo de prueba...');
    const fechaInicio = new Date().toISOString().split('T')[0];
    
    const { data: cicloData, error: cicloError } = await crearCiclo(
      this.usuarioTest.id,
      fechaInicio,
      28
    );

    if (cicloError) {
      throw new Error(`❌ Error creando ciclo: ${cicloError.message}`);
    }

    console.log('✅ Ciclo creado. ID:', cicloData[0].id_ciclo);
    console.log('📅 Fecha inicio:', cicloData[0].fecha_inicio);
    console.log('⏱️  Duración:', cicloData[0].duracion, 'días');

    // Obtener ciclo actual
    console.log('\n🔍 Obteniendo ciclo actual...');
    const { data: cicloActual, error: cicloActualError } = await obtenerCicloActual(this.usuarioTest.id);

    if (cicloActualError && cicloActualError.code !== 'PGRST116') {
      throw new Error(`❌ Error obteniendo ciclo actual: ${cicloActualError.message}`);
    }

    if (cicloActual) {
      console.log('✅ Ciclo actual obtenido');
      console.log('   📅 Fecha inicio:', cicloActual.fecha_inicio);
      console.log('   ⏱️  Duración:', cicloActual.duracion, 'días');
    }

    // Historial de ciclos
    console.log('\n📊 Obteniendo historial de ciclos...');
    const { data: historial, error: historialError } = await obtenerHistorialCiclos(this.usuarioTest.id, 3);

    if (historialError) {
      console.log('⚠️  Error obteniendo historial:', historialError.message);
    } else if (historial && historial.length > 0) {
      console.log(`✅ Historial obtenido. ${historial.length} ciclos encontrados`);
    } else {
      console.log('ℹ️  No hay historial de ciclos (normal en primera prueba)');
    }
  }

  async probarSintomas() {
    console.log('\n4. 🤒 PROBANDO GESTIÓN DE SÍNTOMAS');
    console.log('─'.repeat(40));
    
    // Todos los síntomas
    console.log('📋 Obteniendo todos los síntomas...');
    const { data: todosSintomas, error: sintomasError } = await obtenerSintomasDisponibles();

    if (sintomasError) {
      throw new Error(`❌ Error obteniendo síntomas: ${sintomasError.message}`);
    }

    console.log(`✅ ${todosSintomas.length} síntomas obtenidos`);
    
    // Mostrar algunos síntomas
    if (todosSintomas.length > 0) {
      console.log('\n📝 Primeros 5 síntomas:');
      todosSintomas.slice(0, 5).forEach((sintoma, index) => {
        console.log(`   ${index + 1}. ${sintoma.nombre_sintoma} (${sintoma.categoria})`);
      });
    }

    // Síntomas por categoría
    console.log('\n🎯 Obteniendo síntomas físicos...');
    const { data: sintomasFisicos, error: fisicosError } = await buscarSintomasPorCategoria('FISICO');

    if (fisicosError) {
      console.log('⚠️  Error obteniendo síntomas físicos:', fisicosError.message);
    } else if (sintomasFisicos && sintomasFisicos.length > 0) {
      console.log(`✅ ${sintomasFisicos.length} síntomas físicos encontrados`);
    }
  }

  async probarPredicciones() {
    if (!this.usuarioTest) return;
    
    console.log('\n5. 🔮 PROBANDO PREDICCIONES');
    console.log('─'.repeat(40));
    
    console.log('🎲 Generando predicciones...');
    const { error: genError } = await generarPredicciones(this.usuarioTest.id);

    if (genError) {
      console.log('⚠️  Error generando predicciones:', genError.message);
      return;
    }

    console.log('✅ Predicciones generadas');

    // Obtener predicciones
    console.log('\n🔍 Obteniendo predicciones del usuario...');
    const { data: predicciones, error: predError } = await obtenerPrediccionesUsuario(this.usuarioTest.id);

    if (predError) {
      console.log('⚠️  Error obteniendo predicciones:', predError.message);
    } else if (predicciones && predicciones.length > 0) {
      console.log(`✅ ${predicciones.length} predicciones obtenidas:`);
      predicciones.forEach(pred => {
        console.log(`   📅 ${pred.tipo_de_prediccion}: ${pred.fecha_de_inicio} a ${pred.fecha_de_fin} (${pred.confianza}% confianza)`);
      });
    } else {
      console.log('ℹ️  No hay predicciones disponibles');
    }
  }

  async probarFrases() {
    console.log('\n6. 💝 PROBANDO FRASES MOTIVACIONALES');
    console.log('─'.repeat(40));
    
    const tipos = ['GENERAL', 'CICLO', 'FERTILIDAD', 'ANIMO_BAJO'];
    
    for (const tipo of tipos) {
      console.log(`\n📖 Obteniendo frase ${tipo}...`);
      const { data: frase, error: fraseError } = await obtenerFraseMotivacional(tipo);

      if (fraseError) {
        console.log(`⚠️  Error obteniendo frase ${tipo}:`, fraseError.message);
      } else if (frase) {
        console.log(`✅ "${frase.frases}"`);
      } else {
        console.log(`ℹ️  No hay frases del tipo ${tipo}`);
      }
    }
  }

  async limpiezaPruebas() {
    console.log('\n7. 🧹 LIMPIEZA DE PRUEBAS');
    console.log('─'.repeat(40));
    
    if (this.usuarioTest) {
      console.log('🚪 Cerrando sesión de prueba...');
      const { error } = await cerrarSesion();
      
      if (error) {
        console.log('⚠️  Error cerrando sesión:', error.message);
      } else {
        console.log('✅ Sesión cerrada correctamente');
      }
    }
    
    console.log('\n💡 CONSEJOS:');
    console.log('   • Revisa el Table Editor en Supabase para ver los datos creados');
    console.log('   • Los usuarios de prueba se pueden eliminar desde Auth → Users');
    console.log('   • Ejecuta "npm run setup:db" si necesitas datos iniciales');
  }
}

// Ejecutar pruebas si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const probador = new ProbadorBackend();
  await probador.ejecutarTodasLasPruebas();
}

export { ProbadorBackend };