document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("No has iniciado sesión.");
        window.location.href = "./login.html";
        return;
    }

    try {
        const response = await fetch('hhttps://proyecto-encuesta-ansiedad-estres.onrender.com/perfil', {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            console.log(user);

            document.getElementById('username').textContent = user.nombre || "No disponible";
            document.getElementById('nombre').textContent = user.nombre || "No disponible";
            document.getElementById('correo').textContent = user.correo || "No disponible";
            document.getElementById('numero_control').textContent = user.numero_control || "No disponible";
            document.getElementById('total-encuestas').textContent = user.totalEncuestas ?? "0";

            // Mostrar cuántos tipos de encuestas ha hecho
            let tipos = [];
            if (user.estresEncuestas > 0) tipos.push("Estrés");
            if (user.ansiedadEncuestas > 0) tipos.push("Ansiedad");
            document.getElementById('tipo-encuestas').textContent = tipos.length > 0 ? tipos.join(" y ") : "Ninguna";

            // Mostrar resultados
            const estres = user.resultadoEstres;
            const ansiedad = user.resultadoAnsiedad;

            document.getElementById('resultado-estres').textContent = estres ? `${estres.nivel} (${estres.puntuacion} pts)` : "No disponible";
            document.getElementById('resultado-ansiedad').textContent = ansiedad ? `${ansiedad.nivel} (${ansiedad.puntuacion} pts)` : "No disponible";

        } else {
            alert("Error al obtener datos del perfil.");
            window.location.href = "./login.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al obtener los datos.");
    }
});
