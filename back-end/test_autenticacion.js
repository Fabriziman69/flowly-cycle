// test-auth.js - Pruebas solo de autenticación
import { ProbadorBackend } from './test-back-end.js';

const probador = new ProbadorBackend();
await probador.probarConexion();
await probador.probarAutenticacion();


