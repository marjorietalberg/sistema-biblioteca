document.addEventListener('DOMContentLoaded', () => {
    carregarEmprestimos();

    // Eventos do Modal
    document.getElementById('btnNovoEmprestimo').addEventListener('click', abrirModalNovo);
    document.getElementById('fecharModal').addEventListener('click', fecharModal);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    document.getElementById('formEmprestimo').addEventListener('submit', salvarEmprestimo);
});

async function carregarEmprestimos() {
    try {
        const response = await fetch('/emprestimos');
        if (response.ok) {
            const emprestimos = await response.json();
            renderizarTabela(emprestimos);
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar empréstimos.', 'error');
    }
}

function renderizarTabela(emprestimos) {
    const tbody = document.getElementById('tabelaEmprestimos');
    tbody.innerHTML = '';

    if (emprestimos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhum empréstimo registrado.</td></tr>';
        return;
    }

    emprestimos.forEach(emp => {
        const tr = document.createElement('tr');
        const dataFormatada = emp.data_emprestimo.split('-').reverse().join('/');
        let dataDevolucaoFormatada = '<span style="color: var(--text-muted); font-style: italic;">Pendente</span>';
        
        const classeStatus = emp.status === 'Emprestado' ? 'emprestado' : 'devolvido';
        const badgeStatus = emp.status === 'Emprestado' 
            ? `<span style="background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">EM USO</span>`
            : `<span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">DEVOLVIDO</span>`;
        
        let botaoAcao = '-';
        if (emp.status === 'Emprestado') {
            botaoAcao = `<button class="btn btn-primary btn-small" style="padding: 6px 12px; font-size: 11px; border-radius: 6px; white-space: nowrap;" onclick="devolverLivro(${emp.id})">Baixa / Devolver</button>`;
        } else if (emp.status === 'Devolvido') {
            dataDevolucaoFormatada = `<span style="font-weight: 600; color: var(--text-main);">${emp.data_devolucao.split('-').reverse().join('/')}</span>`;
            botaoAcao = `<span style="color: #10b981; font-size: 16px; font-weight: bold;">✓</span>`;
        }

        tr.innerHTML = `
            <td style="display: flex; align-items: center; gap: 16px;"><img src="${emp.imagem || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop'}" class="table-thumbnail"><span style="font-weight: 700;">${emp.livro}</span></td>
            <td>${emp.usuario}<br><small style="color: var(--text-muted); font-weight: 600;">&#128222; ${emp.telefone || 'N/A'}</small></td>
            <td style="font-weight: 500;">${dataFormatada}</td>
            <td>${dataDevolucaoFormatada}</td>
            <td>${badgeStatus}</td>
            <td>${botaoAcao}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ================= MODAL E FORMULÁRIO =================

async function carregarSelects() {
    try {
        // Carregar livros disponíveis
        const resLivros = await fetch('/livros');
        if (resLivros.ok) {
            const livros = await resLivros.json();
            const selectLivro = document.getElementById('livroSelect');
            selectLivro.innerHTML = '<option value="">Selecione um livro...</option>';
            
            livros.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.id;
                opt.textContent = `${l.titulo} (Disponíveis: ${l.disponiveis})`;
                if (l.disponiveis === 0) opt.disabled = true;
                selectLivro.appendChild(opt);
            });
        }

        // Carregar usuários
        const resUsuarios = await fetch('/usuarios');
        if (resUsuarios.ok) {
            const usuarios = await resUsuarios.json();
            const selectUsuario = document.getElementById('usuarioSelect');
            selectUsuario.innerHTML = '<option value="">Selecione um usuário...</option>';
            
            usuarios.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.nome} (${u.email})`;
                selectUsuario.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar opções', error);
    }
}

function abrirModalNovo() {
    document.getElementById('formEmprestimo').reset();
    carregarSelects().then(() => {
        document.getElementById('modalEmprestimo').classList.add('active');
    });
}

function fecharModal() {
    document.getElementById('modalEmprestimo').classList.remove('active');
}

async function salvarEmprestimo(e) {
    e.preventDefault();

    const livro_id = document.getElementById('livroSelect').value;
    const usuario_id = document.getElementById('usuarioSelect').value;

    try {
        const response = await fetch('/emprestimos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ livro_id, usuario_id })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacao('Empréstimo realizado com sucesso.', 'success');
            fecharModal();
            carregarEmprestimos();
        } else {
            mostrarNotificacao(data.erro || 'Erro ao realizar empréstimo.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
}

// ================= DEVOLVER LIVRO =================

async function devolverLivro(id) {
    if (!confirm('Confirmar devolução do livro?')) return;

    try {
        const response = await fetch(`/emprestimos/${id}/devolver`, { method: 'PUT' });
        const data = await response.json();

        if (response.ok) {
            mostrarNotificacao('Livro devolvido com sucesso.', 'success');
            carregarEmprestimos();
        } else {
            mostrarNotificacao(data.erro || 'Erro ao devolver livro.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
}
