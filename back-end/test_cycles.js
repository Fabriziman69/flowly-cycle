// test-cycles.js - Pruebas solo de ciclos
import { ProbadorBackend } from './test-back-end.js';

const probador = new ProbadorBackend();
// Configurar usuario primero...
await probador.probarCiclos();