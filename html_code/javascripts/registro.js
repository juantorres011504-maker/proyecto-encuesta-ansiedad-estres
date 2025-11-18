document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const numero_control = document.getElementById('numero_control').value;
        const correo = document.getElementById('address').value;
        const contrasena = document.getElementById('password').value;

        try {
            const response = await fetch(`${'https://proyecto-encuesta-ansiedad-estres.onrender.com/register'}, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, numero_control, correo, contrasena })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registro exitoso. Puedes iniciar sesión.');
                window.location.href = 'login.html';
            } else {
                alert(result.message || 'Error al registrar usuario');
            }
        } catch (error) {
            alert('Error al conectar con el servidor');
        }
    });
});
