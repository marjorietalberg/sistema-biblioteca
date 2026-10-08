document.addEventListener('DOMContentLoaded', () => {
    verificarAdmin();
    carregarResumo();
});

async function carregarResumo() {
    try {
        const response = await fetch('/dashboard/stats');
        const data = await response.json();
        
        if (document.getElementById('totalLivros')) {
            document.getElementById('totalLivros').textContent = data.total_livros;
            document.getElementById('livrosDisponiveis').textContent = data.livros_disponiveis;
            document.getElementById('livrosEmprestados').textContent = data.livros_emprestados;
            document.getElementById('totalUsuarios').textContent = data.total_usuarios;
        }
        
        carregarVisao('emprestimos_recentes', data.emprestimosRecentes);
    } catch (error) {
        mostrarNotificacao('Erro ao carregar dados.', 'error');
    }
}

// Função principal responsável por carregar de forma dinâmica (Single Page Application) o conteúdo (livros, usuários, empréstimos) sem recarregar a página.
async function carregarVisao(tipo, dataCache = null) {
    const titulo = document.getElementById('visaoTitulo');
    const thead = document.getElementById('visaoThead');
    const tbody = document.getElementById('visaoTbody');
    const acoes = document.getElementById('visaoAcoes');
    
    if (acoes) {
        if (tipo === 'livros') {
            acoes.innerHTML = '<button onclick="abrirModalAddLivro()" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(37,99,235,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Novo Livro</button>';
        } else {
            acoes.innerHTML = '';
        }
    }
    
    if (!titulo || !thead || !tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 32px; color: #64748b;">Carregando informações...</td></tr>';
    
    try {
        if (tipo === 'livros' || tipo === 'disponiveis') {
            titulo.textContent = tipo === 'livros' ? 'Catálogo de Livros' : 'Livros Disponíveis';
            thead.innerHTML = '<tr><th>ID</th><th>Capa</th><th>Título</th><th>Autor</th><th>Estoque</th><th style="text-align: right;">Ações</th></tr>';
            
            const res = await fetch('/livros');
            let livros = await res.json();
            
            if (tipo === 'disponiveis') livros = livros.filter(l => l.disponiveis > 0);
            
            tbody.innerHTML = '';
            if (livros.length === 0) return tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 32px; color: #64748b;">Nenhum livro encontrado.</td></tr>';
            
            livros.forEach(l => {
                const imgUrl = l.imagem || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=60&auto=format&fit=crop';
                
                
                const btnEditar = `<button onclick="abrirModalEditLivro(${l.id})" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px; margin-right: 8px; transition: all 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">Editar</button>`;
                const btnExcluir = `<button onclick="excluirLivro(${l.id})" style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">Excluir</button>`;

                
                tbody.innerHTML += `<tr>
                    <td style="font-weight:700; color: #0f172a;">#${l.id}</td>
                    <td><img src="${imgUrl}" style="width:48px; height:64px; object-fit:cover; border-radius:6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></td>
                    <td style="font-weight:600; color: #0f172a;">${l.titulo}</td>
                    <td style="color: #475569;">${l.autor}</td>
                    <td><span style="background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px;">${l.disponiveis} / ${l.quantidade}</span></td>
                    <td style="text-align: right;">${btnEditar}${btnExcluir}</td>
                </tr>`;
            });
        } 
        else if (tipo === 'usuarios') {
            titulo.textContent = 'Usuários do Sistema';
            thead.innerHTML = '<tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Privilégio</th><th>Status</th><th style="text-align: right;">Ações</th></tr>';
            
            const res = await fetch('/usuarios');
            const usuarios = await res.json();
            
            tbody.innerHTML = '';
            if (usuarios.length === 0) return tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 32px; color: #64748b;">Nenhum usuário encontrado.</td></tr>';
            
            usuarios.forEach(u => {
                const statusBadge = u.status === 'inativo' ? '<span style="background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase;">INATIVO</span>' : '<span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase;">ATIVO</span>';
                const adminBadge = u.tipo === 'admin' ? '<span style="color: #4f46e5; font-weight: 800; font-size: 13px;">ADMIN</span>' : '<span style="color: #64748b; font-weight: 600; font-size: 13px;">Leitor</span>';
                
                const btnPrivilegio = u.tipo === 'admin' 
                    ? `<button onclick="alterarPrivilegio(${u.id}, 'comum')" style="background: white; border: 1px solid #cbd5e1; color: #64748b; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">Remover Admin</button>`
                    : `<button onclick="alterarPrivilegio(${u.id}, 'admin')" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">Tornar Admin</button>`;
                    
                const btnStatus = u.status === 'inativo'
                    ? `<button onclick="alterarStatus(${u.id}, 'ativo')" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">Ativar</button>`
                    : `<button onclick="alterarStatus(${u.id}, 'inativo')" style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">Desativar</button>`;

                tbody.innerHTML += `<tr>
                    <td style="font-weight:700; color: #0f172a;">#${u.id}</td>
                    <td style="font-weight:600; color: #0f172a;">${u.nome}</td>
                    <td style="color: #475569;">${u.email}</td>
                    <td>${adminBadge}</td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                        ${btnPrivilegio}
                        ${btnStatus}
                    </td>
                </tr>`;
            });
        }
        else if (tipo === 'emprestimos' || tipo === 'emprestimos_recentes') {
            titulo.textContent = tipo === 'emprestimos' ? 'Todos os Empréstimos' : 'Empréstimos Recentes';
            thead.innerHTML = '<tr><th>ID</th><th>Livro</th><th>Usuário</th><th>Data de Retirada</th><th>Status</th></tr>';
            
            let emprestimos = dataCache;
            if (!emprestimos) {
                const res = await fetch('/emprestimos');
                emprestimos = await res.json();
            }
            
            tbody.innerHTML = '';
            if (emprestimos.length === 0) return tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 32px; color: #64748b;">Nenhum empréstimo encontrado.</td></tr>';
            
            emprestimos.forEach(e => {
                const dataStr = new Date(e.data_emprestimo).toLocaleDateString('pt-BR');
                const badgeStatus = e.status === 'Devolvido' 
                    ? '<span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase;">Devolvido</span>'
                    : '<span style="background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase;">Emprestado</span>';
                
                tbody.innerHTML += `<tr><td style="font-weight:700; color: #0f172a;">#${e.id}</td><td style="font-weight:600; color: #0f172a;">${e.livro_titulo}</td><td style="color: #475569;">${e.usuario_nome}</td><td style="color: #475569;">${dataStr}</td><td>${badgeStatus}</td></tr>`;
            });
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 32px; color: #ef4444;">Erro ao carregar dados do servidor.</td></tr>';
    }
}


let livroEditandoId = null;

function abrirModalAddLivro() {
    livroEditandoId = null;
    document.getElementById('modalAddLivroTitulo').textContent = 'Adicionar Novo Livro';
    document.getElementById('formAddLivro').reset();
    document.getElementById('preview1').textContent = '';
    document.getElementById('preview2').textContent = '';
    document.getElementById('preview3').textContent = '';
    
    const modal = document.getElementById('modalAddLivro');
    if(modal) {
        modal.style.display = 'flex';
        void modal.offsetWidth;
        modal.style.opacity = '1';
    }
}

async function abrirModalEditLivro(id) {
    livroEditandoId = id;
    document.getElementById('modalAddLivroTitulo').textContent = 'Editar Livro #' + id;
    
    try {
        const res = await fetch(`/livros/${id}`);
        const livro = await res.json();
        
        document.getElementById('addTitulo').value = livro.titulo;
        document.getElementById('addAutor').value = livro.autor;
        document.getElementById('addCategoria').value = livro.categoria;
        document.getElementById('addQuantidade').value = livro.quantidade;
        document.getElementById('addDescricao').value = livro.descricao || '';
        
        document.getElementById('preview1').textContent = livro.imagem ? 'Imagem Atual Carregada' : '';
        document.getElementById('preview2').textContent = livro.imagem2 ? 'Imagem Atual Carregada' : '';
        document.getElementById('preview3').textContent = livro.imagem3 ? 'Imagem Atual Carregada' : '';
        
        const modal = document.getElementById('modalAddLivro');
        if(modal) {
            modal.style.display = 'flex';
            void modal.offsetWidth;
            modal.style.opacity = '1';
        }
    } catch (e) {
        mostrarNotificacao('Erro ao buscar dados do livro.', 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const btnFechar = document.getElementById('fecharModalAddLivro');
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            document.getElementById('modalAddLivro').style.display = 'none';
        });
    }

    
    const formAdd = document.getElementById('formAddLivro');
    if (formAdd) {
        // Handle file previews
        ['addImagem', 'addImagem2', 'addImagem3'].forEach((id, index) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        document.getElementById('preview' + (index + 1)).textContent = e.target.files[0].name.substring(0, 15) + '...';
                    }
                });
            }
        });

        // Converte a imagem física selecionada pelo usuário no computador para uma String em formato Base64. Isso permite salvar a imagem diretamente como texto no banco de dados SQLite sem precisar de um servidor de arquivos externo.
        function lerArquivoBase64(file) {
            return new Promise((resolve, reject) => {
                if (!file) return resolve('');
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }

        formAdd.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('addTitulo').value;
            const autor = document.getElementById('addAutor').value;
            const categoria = document.getElementById('addCategoria').value;
            const quantidade = document.getElementById('addQuantidade').value;
            const descricao = document.getElementById('addDescricao').value;

            try {
                // Converter imagens para Base64
                const file1 = document.getElementById('addImagem').files[0];
                const file2 = document.getElementById('addImagem2').files[0];
                const file3 = document.getElementById('addImagem3').files[0];

                const imagem = await lerArquivoBase64(file1);
                const imagem2 = await lerArquivoBase64(file2);
                const imagem3 = await lerArquivoBase64(file3);

                
                let payload = { titulo, autor, categoria, quantidade, descricao };
                if (imagem) payload.imagem = imagem;
                if (imagem2) payload.imagem2 = imagem2;
                if (imagem3) payload.imagem3 = imagem3;

                const url = livroEditandoId ? `/livros/${livroEditandoId}` : '/livros';
                const method = livroEditandoId ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });


                const data = await res.json();
                if (res.ok) {
                    mostrarNotificacao('Livro cadastrado com sucesso!', 'success');
                    document.getElementById('modalAddLivro').style.display = 'none';
                    formAdd.reset();
                    document.getElementById('preview1').textContent = '';
                    document.getElementById('preview2').textContent = '';
                    document.getElementById('preview3').textContent = '';
                    carregarVisao('livros');
                    carregarResumo();
                } else {
                    mostrarNotificacao(data.erro || 'Erro ao cadastrar livro.', 'error');
                }
            } catch (err) {
                mostrarNotificacao('Erro de conexão.', 'error');
            }
        });
    }
});

async function alterarPrivilegio(id, novoTipo) {
    if (!confirm('Deseja realmente alterar o privilégio deste usuário?')) return;
    try {
        const res = await fetch(`/usuarios/${id}/tipo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: novoTipo })
        });
        if (res.ok) {
            mostrarNotificacao('Privilégio atualizado com sucesso.', 'success');
            carregarVisao('usuarios');
        } else {
            mostrarNotificacao('Erro ao alterar privilégio.', 'error');
        }
    } catch (e) {
        mostrarNotificacao('Erro de conexão.', 'error');
    }
}

async function alterarStatus(id, novoStatus) {
    if (!confirm('Deseja realmente alterar o status deste usuário?')) return;
    try {
        const res = await fetch(`/usuarios/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        if (res.ok) {
            mostrarNotificacao('Status atualizado com sucesso.', 'success');
            carregarVisao('usuarios');
        } else {
            mostrarNotificacao('Erro ao alterar status.', 'error');
        }
    } catch (e) {
        mostrarNotificacao('Erro de conexão.', 'error');
    }
}

// Faz uma requisição DELETE para a API remover o livro do banco de dados, caso ele não tenha pendências.
async function excluirLivro(id) {
    if (!confirm('Tem certeza que deseja excluir este livro do acervo? Esta ação não pode ser desfeita.')) return;
    try {
        const res = await fetch(`/livros/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (res.ok) {
            mostrarNotificacao('Livro excluído com sucesso!', 'success');
            carregarVisao('livros');
            carregarResumo();
        } else {
            mostrarNotificacao(data.erro || 'Erro ao excluir.', 'error');
        }
    } catch (err) {
        mostrarNotificacao('Erro de conexão com o servidor.', 'error');
    }
}
