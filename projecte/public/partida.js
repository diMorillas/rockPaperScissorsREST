window.onload = () => {
    document.getElementById('codiPartida').addEventListener('click', () => {
        let partidaId = document.getElementById('codiPartida').value;
         
        console.log(partidaId);
        fetch('/api/partida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: partidaId })  // Enviar el ID en el cuerpo de la solicitud
        })
        .then(response => {
            if (response.ok) {
                // Redireccionar a partida.html si la solicitud es exitosa
                window.location.href = 'partida.html';
            } else {
                // Mostrar un mensaje de error si la solicitud falla
                alert('Error al crear la partida');
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            alert('Hubo un problema con la solicitud');
        });
    });
}
