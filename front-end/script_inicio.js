// ===== VARIABLES GLOBALES =====
let datosUsuario = {
    cicloConfigurado: false,
    ultimoPeriodo: null,
    duracionCiclo: 28,
    registrosDiarios: []
};

let calendar; // 👈 variable global para el calendario

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacion();
});

async function inicializarAplicacion() {
    cargarDatosUsuario();
    inicializarCalendario();
    configurarNavegacion();
    crearParticulas();
    configurarEventosRegistro();
    actualizarInterfaz();

    // 👇 Aquí agregas la carga de ciclo y registros desde el backend
    await cargarCicloDesdeBackend();
    await cargarRegistrosDesdeBackend();
    await cargarEstadisticasDesdeBackend(); // 👈 NUEVO
}

async function cargarCicloDesdeBackend() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const res = await fetch(`http://localhost:3000/api/cycles/${userId}`);
        const data = await res.json();

        if (data && data.ciclo) {
            datosUsuario.cicloConfigurado = true;
            datosUsuario.ultimoPeriodo = data.ciclo.fecha_inicio;
            datosUsuario.duracionCiclo = data.ciclo.duracion;

            guardarDatosUsuario();
            actualizarInterfaz();
        }
    } catch (err) {
        console.error("Error cargando ciclo:", err);
    }
}

async function cargarRegistrosDesdeBackend() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const res = await fetch(`http://localhost:3000/api/records/${userId}`);
        const data = await res.json();

        if (data && data.registros) {
            datosUsuario.registrosDiarios = data.registros.map(r => ({
                fecha: r.fecha,
                sintomas: r.sintomas,
                sintomaEspecifico: r.sintoma_especifico,
                categoriasSintomas: r.categorias || [],
                intensidadSintomas: r.intensidad,
                flujo: r.flujo,
                notas: r.notas,
                temperatura: r.temperatura
            }));

            guardarDatosUsuario();
            actualizarInterfaz();
        }
    } catch (err) {
        console.error("Error cargando registros:", err);
    }
}

// ===== GESTIÓN DE DATOS DEL USUARIO =====
function cargarDatosUsuario() {
    // En una aplicación real, aquí se cargarían los datos desde el backend
    const datosGuardados = localStorage.getItem('datosUsuarioMenstrual');
    if (datosGuardados) {
        datosUsuario = JSON.parse(datosGuardados);
    }
}

function guardarDatosUsuario() {
    // En una aplicación real, aquí se enviarían los datos al backend
    localStorage.setItem('datosUsuarioMenstrual', JSON.stringify(datosUsuario));
}

// ===== CONFIGURACIÓN DEL CALENDARIO MENSTRUAL =====
function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('Elemento del calendario no encontrado');
        return;
    }

    if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(generarEventosCalendario());
    }
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'es',
        firstDay: 1,
        events: generarEventosCalendario(),
        eventContent: function(info) {
            const element = document.createElement('div');
            element.className = 'fc-event-main-frame';
            element.innerHTML = `
                <div class="fc-event-title-container">
                    <div class="fc-event-title fc-sticky">${info.event.title}</div>
                </div>
            `;
            return { domNodes: [element] };
        },
        dateClick: function(info) {
            abrirRegistroDiario(info.dateStr);
        }
    });
    
    calendar.render();
}

function generarEventosCalendario() {
    const eventos = [];
    
    // Solo generar eventos si el usuario tiene el ciclo configurado
    if (datosUsuario.cicloConfigurado && datosUsuario.ultimoPeriodo) {
        const ultimoPeriodo = new Date(datosUsuario.ultimoPeriodo);
        const duracionCiclo = datosUsuario.duracionCiclo;
        
        // Generar eventos para los próximos 3 ciclos
        for (let i = -1; i <= 3; i++) {
            const inicioPeriodo = new Date(ultimoPeriodo);
            inicioPeriodo.setDate(inicioPeriodo.getDate() + (i * duracionCiclo));
            
            // Evento de menstruación (dura 5 días)
            for (let j = 0; j < 5; j++) {
                const fechaMenstruacion = new Date(inicioPeriodo);
                fechaMenstruacion.setDate(fechaMenstruacion.getDate() + j);
                
                eventos.push({
                    title: 'Menstruación',
                    start: fechaMenstruacion.toISOString().split('T')[0],
                    color: '#e91e63',
                    classNames: ['fc-event-menstruacion']
                });
            }
            
            // Evento de ventana fértil (días 10-17 del ciclo)
            const inicioFertilidad = new Date(inicioPeriodo);
            inicioFertilidad.setDate(inicioFertilidad.getDate() + 10);
            
            const finFertilidad = new Date(inicioPeriodo);
            finFertilidad.setDate(finFertilidad.getDate() + 17);
            
            eventos.push({
                title: 'Ventana fértil',
                start: inicioFertilidad.toISOString().split('T')[0],
                end: finFertilidad.toISOString().split('T')[0],
                color: '#4caf50',
                classNames: ['fc-event-fertilidad']
            });
        }
    }
    
    // Agregar eventos de registros diarios
    datosUsuario.registrosDiarios.forEach(registro => {
        eventos.push({
            title: 'Registro diario',
            start: registro.fecha,
            color: '#ff9800',
            classNames: ['fc-event-sintomas']
        });
    });
    
    return eventos;
}

// ===== CONFIGURACIÓN DE LA NAVEGACIÓN =====
function configurarNavegacion() {
    const secciones = {
        'btn_calendario': 'seccion-calendario',
        'btn_estadisticas': 'seccion-estadisticas',
        'btn_informativa': 'seccion-informativa'
    };

    // Ocultar todas las secciones excepto la de calendario
    Object.values(secciones).forEach(seccionId => {
        const seccion = document.getElementById(seccionId);
        if (seccion) {
            seccion.classList.add('d-none');
        }
    });

    // Mostrar la sección de calendario por defecto
    const seccionCalendario = document.getElementById('seccion-calendario');
    const btnCalendario = document.getElementById('btn_calendario');
    
    if (seccionCalendario && btnCalendario) {
        seccionCalendario.classList.remove('d-none');
        btnCalendario.classList.add('active');
    }

    // Agregar event listeners a cada botón de navegación
    Object.keys(secciones).forEach(botonId => {
        const boton = document.getElementById(botonId);
        if (boton) {
            boton.addEventListener('click', function() {
                cambiarSeccion(botonId, secciones);
            });
        }
    });
}

function cambiarSeccion(botonId, secciones) {
    // Ocultar todas las secciones
    Object.values(secciones).forEach(seccionId => {
        const seccion = document.getElementById(seccionId);
        if (seccion) {
            seccion.classList.add('d-none');
        }
    });
    
    // Remover clase active de todos los botones
    Object.keys(secciones).forEach(btnId => {
        const boton = document.getElementById(btnId);
        if (boton) {
            boton.classList.remove('active');
        }
    });
    
    // Mostrar la sección correspondiente y marcar botón como activo
    const seccionId = secciones[botonId];
    const seccion = document.getElementById(seccionId);
    const boton = document.getElementById(botonId);
    
    if (seccion && boton) {
        seccion.classList.remove('d-none');
        boton.classList.add('active');
        
        // Si es la sección de estadísticas, actualizar los datos
        if (botonId === 'btn_estadisticas') {
            actualizarEstadisticas();
        }
    }
}

// ===== GESTIÓN DEL REGISTRO MENSTRUAL =====
function configurarEventosRegistro() {
    const btnRegistro = document.getElementById('btn_registro');
    const btnGuardarRegistroInicial = document.getElementById('btnGuardarRegistroInicial');
    const btnGuardarRegistroDiario = document.getElementById('btnGuardarRegistroDiario');
    
    if (btnRegistro) {
        btnRegistro.addEventListener('click', function() {
            if (!datosUsuario.cicloConfigurado) {
                // Si no tiene ciclo configurado, abrir formulario inicial
                const modalRegistroInicial = new bootstrap.Modal(document.getElementById('modalRegistroInicial'));
                modalRegistroInicial.show();
            } else {
                // Si ya tiene ciclo configurado, abrir registro diario
                abrirRegistroDiario();
            }
        });
    }
    
    if (btnGuardarRegistroInicial) {
        btnGuardarRegistroInicial.addEventListener('click', guardarRegistroInicial);
    }
    
    if (btnGuardarRegistroDiario) {
        btnGuardarRegistroDiario.addEventListener('click', guardarRegistroDiario);
    }
}

function guardarRegistroInicial() {
    const ultimoPeriodo = document.getElementById('ultimoPeriodo').value;
    const duracionCiclo = parseInt(document.getElementById('duracionCiclo').value);
    
    if (!ultimoPeriodo || !duracionCiclo) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }
    
    // Guardar datos del usuario
    datosUsuario.cicloConfigurado = true;
    datosUsuario.ultimoPeriodo = ultimoPeriodo;
    datosUsuario.duracionCiclo = duracionCiclo;
    
    guardarDatosUsuario();
    actualizarInterfaz();
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroInicial'));
    modal.hide();
    
    // Mostrar mensaje de éxito
    alert('¡Configuración guardada exitosamente! Ahora puedes llevar tu registro diario.');
}

function abrirRegistroDiario(fechaEspecifica = null) {
    const fechaActual = fechaEspecifica ? fechaEspecifica : new Date().toISOString().split('T')[0];
    
    // Actualizar la fecha en el formulario
    document.getElementById('fechaActual').textContent = formatearFecha(fechaActual);
    
    // Limpiar formulario
    document.getElementById('formRegistroDiario').reset();
    
    // Si ya existe un registro para esta fecha, cargar los datos
    const registroExistente = datosUsuario.registrosDiarios.find(reg => reg.fecha === fechaActual);
    if (registroExistente) {
        cargarDatosRegistroExistente(registroExistente);
    }
    
    // Mostrar modal
    const modalRegistroDiario = new bootstrap.Modal(document.getElementById('modalRegistroDiario'));
    modalRegistroDiario.show();
}

function cargarDatosRegistroExistente(registro) {
    document.getElementById('sintomas').value = registro.sintomas || '';
    document.getElementById('sintomaEspecifico').value = registro.sintomaEspecifico || '';
    document.getElementById('intensidadSintomas').value = registro.intensidadSintomas || '';
    document.getElementById('flujo').value = registro.flujo || '';
    document.getElementById('notas').value = registro.notas || '';
    document.getElementById('temperatura').value = registro.temperatura || '';
    
    // Marcar checkboxes de categorías
    const categorias = registro.categoriasSintomas || [];
    categorias.forEach(categoria => {
        const checkbox = document.querySelector(`input[value="${categoria}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

// ===== GUARDAR REGISTRO DIARIO =====
async function guardarRegistroDiario() {
    const userId = localStorage.getItem("userId");
    const fechaActual = new Date().toISOString().split('T')[0];

    // Obtener valores del formulario
    const sintomas = document.getElementById('sintomas').value;
    const sintomaEspecifico = document.getElementById('sintomaEspecifico').value;
    const intensidadSintomas = document.getElementById('intensidadSintomas').value;
    const flujo = document.getElementById('flujo').value;
    const notas = document.getElementById('notas').value;
    const temperatura = document.getElementById('temperatura').value;

    // Obtener categorías seleccionadas (checkboxes)
    const categoriasCheckboxes = document.querySelectorAll('.categorias-sintomas input[type="checkbox"]:checked');
    const categoriasSintomas = Array.from(categoriasCheckboxes).map(cb => cb.value);

    try {
        // Enviar datos al backend
        const res = await fetch("http://localhost:3000/api/records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                fecha: fechaActual,
                sintomas,
                sintomaEspecifico,
                categoriasSintomas,
                intensidadSintomas,
                flujo,
                notas,
                temperatura: temperatura ? parseFloat(temperatura) : null
            })
        });

        const data = await res.json();

        // Manejo de errores
        if (data.error) {
            alert("❌ Error: " + data.error);
        } else {
            // ✅ Registro guardado correctamente
            alert("✅ Registro diario guardado");

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("modalRegistroDiario"));
            modal.hide();

            // Recargar registros desde el backend para mantener sincronizado
            await cargarRegistrosDesdeBackend();

            // Refrescar interfaz y calendario
            actualizarInterfaz();
            if (calendar) {
                calendar.removeAllEvents();
                calendar.addEventSource(generarEventosCalendario());
            }
        }
    } catch (err) {
        console.error("Error guardando registro:", err);
        alert("❌ No se pudo conectar con el servidor");
    }
}

// ===== ACTUALIZACIÓN DE LA INTERFAZ =====
function actualizarInterfaz() {
    // Actualizar texto del botón de registro
    const textoRegistro = document.getElementById('registro-texto');
    if (textoRegistro) {
        textoRegistro.textContent = datosUsuario.cicloConfigurado ? 'Registro Diario' : 'Registro';
    }
    
    // Actualizar calendario
    if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(generarEventosCalendario());
    }
}

function actualizarEstadisticas() {
    if (!datosUsuario.cicloConfigurado) {
        document.getElementById('duracion-promedio').textContent = '-- días';
        document.getElementById('ciclo-actual').textContent = 'Día --';
        document.getElementById('proximo-periodo').textContent = '-- días';
        return;
    }

    // Fecha del último periodo
    const ultimoPeriodo = new Date(datosUsuario.ultimoPeriodo);
    const hoy = new Date();

    // Diferencia en días desde el último periodo
    const diffTiempo = hoy.getTime() - ultimoPeriodo.getTime();
    const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

    // Día actual del ciclo
    const diaCicloActual = (diffDias % datosUsuario.duracionCiclo) + 1;

    // Días hasta el próximo periodo
    const diasHastaProximoPeriodo = datosUsuario.duracionCiclo - (diffDias % datosUsuario.duracionCiclo);

    // Actualizar estadísticas en la interfaz
    document.getElementById('duracion-promedio').textContent = `${datosUsuario.duracionCiclo} días`;
    document.getElementById('ciclo-actual').textContent = `Día ${diaCicloActual}`;
    document.getElementById('proximo-periodo').textContent = `${diasHastaProximoPeriodo} días`;
}

// ===== FUNCIONES UTILITARIAS =====
function formatearFecha(fechaISO) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
}

function crearParticulas() {
    const particlesContainer = document.getElementById('headerParticles');
    
    if (!particlesContainer) {
        console.error('Contenedor de partículas no encontrado');
        return;
    }
    
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// ===== FUNCIONES PARA INTEGRACIÓN CON BACKEND =====
function enviarDatosAlBackend(endpoint, datos) {
    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error al enviar datos al backend:', error);
        guardarDatosLocalmente(datos);
    });
}

function guardarDatosLocalmente(datos) {
    const pendientes = JSON.parse(localStorage.getItem('datosPendientes') || '[]');
    pendientes.push({
        datos: datos,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('datosPendientes', JSON.stringify(pendientes));
}

function sincronizarDatosPendientes() {
    const pendientes = JSON.parse(localStorage.getItem('datosPendientes') || '[]');
    
    pendientes.forEach(async (item, index) => {
        try {
            await enviarDatosAlBackend('/api/sincronizar', item.datos);
            pendientes.splice(index, 1);
        } catch (error) {
            console.error('Error al sincronizar datos pendientes:', error);
        }
    });
    
    localStorage.setItem('datosPendientes', JSON.stringify(pendientes));
}

// ===== GUARDAR CICLO INICIAL =====
document.addEventListener("DOMContentLoaded", function() {
    const btnGuardarCiclo = document.getElementById("btnGuardarRegistroInicial");
    if (btnGuardarCiclo) {
        btnGuardarCiclo.addEventListener("click", async function() {
            const ultimoPeriodo = document.getElementById("ultimoPeriodo").value;
            const duracionCiclo = document.getElementById("duracionCiclo").value;
            const userId = localStorage.getItem("userId");

            if (!ultimoPeriodo || !duracionCiclo) {
                alert("❌ Completa todos los campos");
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/api/cycles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        fecha_inicio: ultimoPeriodo,
                        duracion: duracionCiclo
                    })
                });

                const data = await res.json();

                if (data.error) {
                    alert("❌ Error: " + data.error);
                } else {
                    alert("✅ Ciclo guardado correctamente");
                    const modal = bootstrap.Modal.getInstance(document.getElementById("modalRegistroInicial"));
                    modal.hide();
                    
                    // Actualizar datos locales
                    datosUsuario.cicloConfigurado = true;
                    datosUsuario.ultimoPeriodo = ultimoPeriodo;
                    datosUsuario.duracionCiclo = parseInt(duracionCiclo);
                    guardarDatosUsuario();
                    actualizarInterfaz();
                }
            } catch (err) {
                console.error("Error guardando ciclo:", err);
                alert("❌ No se pudo conectar con el servidor");
            }
        });
    }
});

// ===== PERFIL DE USUARIO =====
document.addEventListener("DOMContentLoaded", function() {
    // Verificar sesión
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "index_inicio.html";
        return;
    }

    // Mostrar datos del usuario en el perfil
    const usernameEl = document.getElementById("perfil-username");
    const emailEl = document.getElementById("perfil-email");

    const username = localStorage.getItem("username") || "Usuario";
    const email = localStorage.getItem("email") || "correo@ejemplo.com";

    if (usernameEl) usernameEl.textContent = username;
    if (emailEl) emailEl.textContent = email;

    // Botón de cerrar sesión
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "./index.html";
        });
    }
});

// ===== ESTADÍSTICAS REALES =====
async function cargarEstadisticasDesdeBackend() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        // Pedimos TODOS los ciclos del usuario
        const res = await fetch(`http://localhost:3000/api/cycles/${userId}?all=true`);
        const data = await res.json();

        if (data && data.ciclos && data.ciclos.length > 0) {
            // Guardamos el ciclo más reciente
            const cicloMasReciente = data.ciclos[0];
            datosUsuario.cicloConfigurado = true;
            datosUsuario.ultimoPeriodo = cicloMasReciente.fecha_inicio;
            datosUsuario.duracionCiclo = cicloMasReciente.duracion;

            guardarDatosUsuario();

            // Actualizamos estadísticas con TODOS los ciclos
            actualizarEstadisticasReales(data.ciclos);
        }
    } catch (err) {
        console.error("Error cargando estadísticas:", err);
    }
}

function actualizarEstadisticasReales(ciclos) {
    if (!ciclos || ciclos.length === 0) {
        document.getElementById('duracion-promedio').textContent = '-- días';
        document.getElementById('ciclo-actual').textContent = 'Día --';
        document.getElementById('proximo-periodo').textContent = '-- días';
        return;
    }

    // Calcular duración promedio de todos los ciclos
    const duraciones = ciclos.map(c => c.duracion);
    const promedio = Math.round(duraciones.reduce((a, b) => a + b, 0) / duraciones.length);

    // Usamos el ciclo más reciente para cálculos de día actual
    const cicloMasReciente = ciclos[0];
    const ultimoPeriodo = new Date(cicloMasReciente.fecha_inicio);
    const hoy = new Date();

    const diffTiempo = hoy.getTime() - ultimoPeriodo.getTime();
    const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

    const diaCicloActual = (diffDias % cicloMasReciente.duracion) + 1;
    const diasHastaProximoPeriodo = cicloMasReciente.duracion - (diffDias % cicloMasReciente.duracion);

    // Actualizar interfaz
    document.getElementById('duracion-promedio').textContent = `${promedio} días`;
    document.getElementById('ciclo-actual').textContent = `Día ${diaCicloActual}`;
    document.getElementById('proximo-periodo').textContent = `${diasHastaProximoPeriodo} días`;
}


