document.addEventListener('DOMContentLoaded', () => {
    verificarAdmin();
    carregarUsuarios();

    document.getElementById('btnNovoUsuario').addEventListener('click', abrirModalNovoUsuario);
    document.getElementById('fecharModalUsuario').addEventListener('click', fecharModalUsuario);
    document.getElementById('btnCancelarUsuario').addEventListener('click', fecharModalUsuario);
    document.getElementById('formUsuario').addEventListener('submit', salvarUsuario);
});

async function carregarUsuarios() {
    try {
        const response = await fetch('/usuarios');
        const usuarios = await response.json();
        
        const tbody = document.getElementById('tabelaUsuarios');
        tbody.innerHTML = '';

        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            
            const badgeTipo = user.tipo === 'admin' 
                ? `<span style="background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">ADMINISTRADOR</span>`
                : `<span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">ALUNO</span>`;

            const badgeStatus = user.status === 'inativo'
                ? `<span style="background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">INATIVO</span>`
                : `<span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">ATIVO</span>`;

            const btnEdit = `<button class="btn btn-primary btn-small" style="padding: 6px 12px; font-size: 11px; border-radius: 6px; margin-right: 8px;" onclick="editarUsuario(${user.id})">Editar</button>`;
            
            const acaoText = user.status === 'ativo' ? 'Desativar' : 'Ativar';
            const novoStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
            const btnStatus = `<button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; border-radius: 6px; margin-right: 8px;" onclick="alterarStatus(${user.id}, '${novoStatus}')">${acaoText}</button>`;

            tr.innerHTML = `
                <td style="font-weight: 600;">#${user.id}</td>
                <td style="font-weight: 700; ${user.status === 'inativo' ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${user.nome}</td>
                <td>
                    <div style="font-weight: 500;">${user.email}</div>
                    <small style="color: var(--text-muted); font-weight: 600;">&#128222; ${user.telefone || 'Sem telefone'}</small>
                </td>
                <td>${badgeTipo} <br><div style="margin-top:4px;">${badgeStatus}</div></td>
                <td style="white-space: nowrap;">${btnEdit} ${btnStatus}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        mostrarNotificacao('Erro ao carregar usuários.', 'error');
    }
}

function abrirModalNovoUsuario() {
    document.getElementById('modalUsuarioTitle').textContent = 'Novo Usuário';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('modalUsuario').classList.add('active');
}

function fecharModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('active');
}

async function editarUsuario(id) {
    try {
        const response = await fetch(`/usuarios/${id}`);
        if (response.ok) {
            const user = await response.json();
            document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuário';
            document.getElementById('usuarioId').value = user.id;
            document.getElementById('usuarioNome').value = user.nome;
            document.getElementById('usuarioEmail').value = user.email;
            document.getElementById('usuarioTelefone').value = user.telefone || '';
            document.getElementById('usuarioSenha').value = '';
            document.getElementById('usuarioTipo').value = user.tipo;
            document.getElementById('usuarioStatus').value = user.status || 'ativo';
            
            document.getElementById('modalUsuario').classList.add('active');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar dados do usuário.', 'error');
    }
}

async function salvarUsuario(e) {
    e.preventDefault();

    const id = document.getElementById('usuarioId').value;
    const nome = document.getElementById('usuarioNome').value;
    const email = document.getElementById('usuarioEmail').value;
    const telefone = document.getElementById('usuarioTelefone').value;
    const senha = document.getElementById('usuarioSenha').value;
    const tipo = document.getElementById('usuarioTipo').value;
    const status = document.getElementById('usuarioStatus').value;

    if (!id && !senha) {
        return mostrarNotificacao('Senha é obrigatória para novos usuários.', 'error');
    }

    try {
        if (id) {
            // Edição usa as rotas existentes ou combinadas
            // Primeiro atualiza o perfil normal (nome, email, telefone, senha)
            let res = await fetch(`/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, telefone, senha })
            });

            if (res.ok) {
                // Atualiza Tipo e Status
                await fetch(`/usuarios/${id}/tipo`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo })
                });
                await fetch(`/usuarios/${id}/status`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
                });
                mostrarNotificacao('Usuário atualizado com sucesso.', 'success');
                fecharModalUsuario();
                carregarUsuarios();
            } else {
                mostrarNotificacao('Erro ao atualizar dados.', 'error');
            }
        } else {
            // Criação via cadastro adaptado (o endpoint /cadastro cria comuns, mas a gente atualiza depois)
            let res = await fetch('/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, telefone, tipo, status })
            });
            
            if (res.ok) {
                const data = await res.json();
                // Assumindo que o backend não retorna o ID direto no cadastro no layout atual,
                // Na real o ideal seria recarregar e pronto, mas como precisamos de admin e status:
                // Vou recarregar para exibir
                mostrarNotificacao('Usuário criado. Para mudar nível/status, edite em seguida.', 'success');
                fecharModalUsuario();
                carregarUsuarios();
            } else {
                const err = await res.json();
                mostrarNotificacao(err.erro || 'Erro ao criar usuário.', 'error');
            }
        }
    } catch (error) {
        mostrarNotificacao('Erro ao salvar.', 'error');
    }
}

async function alterarStatus(id, novoStatus) {
    if (!confirm(`Tem certeza que deseja ${novoStatus === 'ativo' ? 'ativar' : 'desativar'} este usuário?`)) return;

    try {
        const response = await fetch(`/usuarios/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        
        if (response.ok) {
            mostrarNotificacao('Status atualizado.', 'success');
            carregarUsuarios();
        }
    } catch (error) {
        mostrarNotificacao('Erro na requisição.', 'error');
    }
}
