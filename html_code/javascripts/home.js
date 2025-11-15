document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert("No has iniciado sesión.");
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('.perfil span').textContent = `Usuario: ${user.nombre}`;

    // Cerrar sesión
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
