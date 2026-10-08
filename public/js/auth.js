// Utilitário para notificações e autenticação

// Verificar se não está logado (exceto páginas de login/cadastro)
const paginaAtual = window.location.pathname;
const paginasPublicas = ['/login.html', '/cadastro.html', '/', '/index.html'];
const paginasAdmin = ['/dashboard.html', '/livros.html', '/emprestimos.html'];
const paginasLeitor = ['/painel.html'];

const userStr = sessionStorage.getItem('usuario');
const usuario = userStr ? JSON.parse(userStr) : null;

if (!paginasPublicas.includes(paginaAtual)) {
    if (!usuario) {
        window.location.href = '/login.html';
    } else if (usuario.tipo === 'admin' && paginasLeitor.includes(paginaAtual)) {
        window.location.href = '/dashboard.html';
    } else if (usuario.tipo !== 'admin' && paginasAdmin.includes(paginaAtual)) {
        window.location.href = '/painel.html';
    }
}

// Botão Sair
document.addEventListener('DOMContentLoaded', () => {
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('usuario');
            window.location.href = '/login.html';
        });
    }
});

// Função de Notificação
function mostrarNotificacao(mensagem, tipo = 'success') {
    const notif = document.getElementById('notificacao');
    if (!notif) return;

    // Build Premium Toast HTML
    const iconHtml = tipo === 'success' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

    notif.innerHTML = iconHtml + '<span>' + mensagem + '</span>';
    
    notif.style.display = 'flex';
    notif.className = ''; // reset classes
    
    if (tipo === 'success') {
        notif.style.backgroundColor = '#10b981'; // Premium Green
    } else {
        notif.style.backgroundColor = '#ef4444'; // Premium Red
    }

    // Trigger reflow
    void notif.offsetWidth;

    notif.classList.add('show');

    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => {
            if(!notif.classList.contains('show')) notif.style.display = 'none';
        }, 300);
    }, 4000);
}


// Toggle Password Logic
const togglePasswordBtns = document.querySelectorAll('.password-toggle');
togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
        // Find the adjacent password input
        const input = this.parentElement.querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Toggle icon (eye / eye-off)
        if (type === 'text') {
            this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        } else {
            this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        }
    });
});
