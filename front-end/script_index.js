document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const showFormBtn = document.querySelector('.show-form-btn');
    const formOverlay = document.querySelector('.form-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const switchFormLinks = document.querySelectorAll('.switch-form-link');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // Mostrar formulario
    showFormBtn.addEventListener('click', function() {
        formOverlay.classList.add('active');
        // Mostrar página de login por defecto
        showFormPage('login');
    });
    
    // Cerrar formulario
    closeBtn.addEventListener('click', function() {
        formOverlay.classList.remove('active');
    });
    
    // Cerrar al hacer clic fuera del formulario
    formOverlay.addEventListener('click', function(e) {
        if (e.target === formOverlay) {
            formOverlay.classList.remove('active');
        }
    });
    
    // Cambiar entre formularios
    switchFormLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            showFormPage(target);
        });
    });
    
    // Función para mostrar página del formulario
    function showFormPage(page) {
        // Ocultar todas las páginas
        document.querySelectorAll('.form-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Mostrar la página seleccionada
        if (page === 'login') {
            loginPage.classList.add('active');
        } else if (page === 'register') {
            registerPage.classList.add('active');
        }
    }
    
    // Alternar visibilidad de contraseña
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Validación y envío del formulario de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validación básica
        if (!email || !password) {
            showAlert('Por favor, completa todos los campos', 'danger');
            return;
        }
        
        // Validación de formato de email
        if (!isValidEmail(email)) {
            showAlert('Por favor, ingresa un correo electrónico válido', 'danger');
            return;
        }
        
        // Simulación de envío
        showAlert('Iniciando sesión...', 'info');
        
        setTimeout(() => {
            showAlert('¡Inicio de sesión exitoso!', 'success');
            formOverlay.classList.remove('active');
            loginForm.reset();
        }, 1500);
    });
    
    // Validación y envío del formulario de registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const acceptTerms = document.getElementById('accept-terms').checked;
        
        // Validaciones
        if (!username || !email || !password || !confirmPassword) {
            showAlert('Por favor, completa todos los campos', 'danger');
            return;
        }
        
        // Validación de formato de email
        if (!isValidEmail(email)) {
            showAlert('Por favor, ingresa un correo electrónico válido', 'danger');
            return;
        }
        
        if (password.length < 8) {
            showAlert('La contraseña debe tener al menos 8 caracteres', 'danger');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('Las contraseñas no coinciden', 'danger');
            return;
        }
        
        if (!acceptTerms) {
            showAlert('Debes aceptar los términos y condiciones', 'danger');
            return;
        }
        
        // Simulación de envío
        showAlert('Creando tu cuenta...', 'info');
        
        setTimeout(() => {
            showAlert('¡Cuenta creada exitosamente!', 'success');
            formOverlay.classList.remove('active');
            registerForm.reset();
            showFormPage('login');
        }, 2000);
    });
    
    // Función para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Función para mostrar alertas
    function showAlert(message, type) {
        // Remover alerta anterior si existe
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Crear nueva alerta
        const alert = document.createElement('div');
        alert.className = `custom-alert alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && formOverlay.classList.contains('active')) {
            formOverlay.classList.remove('active');
        }
    });
    
    // Validación en tiempo real para el formulario de registro
    const registerPassword = document.getElementById('register-password');
    const registerConfirm = document.getElementById('register-confirm');
    
    if (registerPassword && registerConfirm) {
        registerConfirm.addEventListener('input', function() {
            if (registerPassword.value !== registerConfirm.value) {
                registerConfirm.classList.add('is-invalid');
                registerConfirm.classList.remove('is-valid');
            } else {
                registerConfirm.classList.remove('is-invalid');
                registerConfirm.classList.add('is-valid');
            }
        });
        
        registerPassword.addEventListener('input', function() {
            if (registerPassword.value.length < 8) {
                registerPassword.classList.add('is-invalid');
                registerPassword.classList.remove('is-valid');
            } else {
                registerPassword.classList.remove('is-invalid');
                registerPassword.classList.add('is-valid');
            }
            
            // Actualizar validación de confirmación
            if (registerPassword.value !== registerConfirm.value) {
                registerConfirm.classList.add('is-invalid');
                registerConfirm.classList.remove('is-valid');
            } else {
                registerConfirm.classList.remove('is-invalid');
                registerConfirm.classList.add('is-valid');
            }
        });
    }
});

// script_index.js

// --- LOGIN ---
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.error) {
      alert("❌ Error: " + data.error);
    } else {
      alert("✅ Bienvenido " + data.user.email);

      // Guardar el userId en localStorage
      localStorage.setItem("userId", data.user.id);

      // Redirigir al calendario
      window.location.href = "inicio_calendario.html";
    }
  } catch (err) {
    console.error("Error en login:", err);
    alert("❌ No se pudo conectar con el servidor");
  }
});


// --- REGISTRO ---
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-confirm").value;

  if (password !== confirm) {
    alert("❌ Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username })
    });

    const data = await res.json();

    if (data.error) {
      alert("❌ Error: " + data.error);
    } else {
      alert("✅ Usuario registrado con éxito: " + data.user.email);
      // Opcional: redirigir al login
      document.querySelector('[data-target="login"]').click();
    }
  } catch (err) {
    console.error("Error en registro:", err);
    alert("❌ No se pudo conectar con el servidor");
  }
});

localStorage.setItem("userId", data.user.id);
localStorage.setItem("username", data.user.username || "Usuario");
localStorage.setItem("email", data.user.email);
