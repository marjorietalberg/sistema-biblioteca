document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (senha.length < 6) {
        mostrarNotificacao('A senha deve ter no mínimo 6 caracteres.', 'error');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarNotificacao('As senhas não coincidem.', 'error');
        return;
    }

    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, telefone })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacao('Usuário cadastrado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            mostrarNotificacao(data.erro || 'Erro ao cadastrar.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
});
