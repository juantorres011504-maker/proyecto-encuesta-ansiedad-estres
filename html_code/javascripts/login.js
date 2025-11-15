document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const correo = document.getElementById('username').value;
        const contrasena = document.getElementById('password').value;

        try {
            const response = await fetch(`${window.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contrasena })
            });


            if (response.ok) {
                const data = await response.json();
                console.log('Login exitoso:', data);

                // Guardar token y usuario en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirigir al home
                window.location.href = 'menu.html';
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
    });
});
