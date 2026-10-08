document.addEventListener('DOMContentLoaded', () => {
    const linkAdmin = document.getElementById('linkAdmin');
    if (linkAdmin) {
        linkAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('email').value = 'admin@biblioteca.com';
            document.getElementById('senha').value = 'admin123';
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        });
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            if (data.usuario.tipo === 'admin') {
                window.location.href = '/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        } else {
            mostrarNotificacao(data.erro || 'E-mail ou senha inválidos.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
});
