let livrosCache = [];
let capaBase64 = '';
let capaBase64_2 = '';
let capaBase64_3 = '';

document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();

    // Eventos do Modal
    document.getElementById('btnNovoLivro').addEventListener('click', abrirModalNovo);
    document.getElementById('fecharModal').addEventListener('click', fecharModal);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    document.getElementById('formLivro').addEventListener('submit', salvarLivro);
    
    function setupImageUpload(inputId, previewId, textId, callback) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const result = evt.target.result;
                        callback(result);
                        const preview = document.getElementById(previewId);
                        preview.src = result;
                        preview.style.display = 'block';
                        document.getElementById(textId).style.display = 'none';
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    setupImageUpload('inputCapa', 'previewCapa', 'textCapa', (res) => capaBase64 = res);
    setupImageUpload('inputCapa2', 'previewCapa2', 'textCapa2', (res) => capaBase64_2 = res);
    setupImageUpload('inputCapa3', 'previewCapa3', 'textCapa3', (res) => capaBase64_3 = res);

    // Pesquisa
    document.getElementById('inputPesquisa').addEventListener('input', filtrarLivros);
});

async function carregarLivros() {
    try {
        const response = await fetch('/livros');
        if (response.ok) {
            livrosCache = await response.json();
            renderizarTabela(livrosCache);
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar livros.', 'error');
    }
}

function renderizarTabela(livros) {
    const tbody = document.getElementById('tabelaLivros');
    tbody.innerHTML = '';

    if (livros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum livro encontrado.</td></tr>';
        return;
    }

    livros.forEach(livro => {
        const tr = document.createElement('tr');
        const img = livro.imagem || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop';
        tr.innerHTML = `
            <td style="display: flex; align-items: center; gap: 16px;">
                <img src="${img}" class="table-thumbnail">
                <span style="font-weight: 700;">${livro.titulo}</span>
            </td>
            <td>${livro.autor}</td>
            <td><span style="background: var(--bg-color); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--text-muted); white-space: nowrap;">${livro.categoria}</span></td>
            <td style="font-weight: 600;">${livro.quantidade}</td>
            <td style="font-weight: 600; color: ${livro.disponiveis > 0 ? '#10b981' : '#ef4444'};">${livro.disponiveis}</td>
            <td>
                <div style="display: flex; gap: 8px; flex-wrap: nowrap;">
                    <button class="btn btn-outline btn-small" style="padding: 6px 12px; font-size: 11px; border-radius: 6px; white-space: nowrap;" onclick="editarLivro(${livro.id})">Editar</button>
                    <button class="btn btn-danger btn-small" style="padding: 6px 12px; font-size: 11px; border-radius: 6px; white-space: nowrap;" onclick="excluirLivro(${livro.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarLivros(e) {
    const termo = e.target.value.toLowerCase();
    const filtrados = livrosCache.filter(l => 
        l.titulo.toLowerCase().includes(termo) || 
        l.autor.toLowerCase().includes(termo)
    );
    renderizarTabela(filtrados);
}

// ================= MODAL E FORMULÁRIO =================

function abrirModalNovo() {
    document.getElementById('modalTitle').textContent = 'Novo Livro';
    document.getElementById('formLivro').reset();
    document.getElementById('livroId').value = '';
    
    capaBase64 = '';
    capaBase64_2 = '';
    capaBase64_3 = '';
    document.getElementById('previewCapa').style.display = 'none';
    document.getElementById('textCapa').style.display = 'block';
    document.getElementById('previewCapa2').style.display = 'none';
    document.getElementById('textCapa2').style.display = 'block';
    document.getElementById('previewCapa3').style.display = 'none';
    document.getElementById('textCapa3').style.display = 'block';

    document.getElementById('modalLivro').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalLivro').classList.remove('active');
}

async function salvarLivro(e) {
    e.preventDefault();

    const id = document.getElementById('livroId').value;
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const categoria = document.getElementById('categoria').value;
    const quantidade = document.getElementById('quantidade').value;
    const descricao = document.getElementById('descricao').value;

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `/livros/${id}` : '/livros';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                titulo, autor, categoria, quantidade, descricao, 
                imagem: capaBase64,
                imagem2: capaBase64_2,
                imagem3: capaBase64_3
            })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacao(id ? 'Livro atualizado com sucesso.' : 'Livro cadastrado com sucesso.');
            fecharModal();
            carregarLivros();
        } else {
            mostrarNotificacao(data.erro || 'Erro ao salvar livro.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
}

// ================= EDITAR / EXCLUIR =================

async function editarLivro(id) {
    try {
        const response = await fetch(`/livros/${id}`);
        if (response.ok) {
            const livro = await response.json();
            document.getElementById('modalTitle').textContent = 'Editar Livro';
            document.getElementById('livroId').value = livro.id;
            document.getElementById('titulo').value = livro.titulo;
            document.getElementById('autor').value = livro.autor;
            document.getElementById('categoria').value = livro.categoria;
            document.getElementById('quantidade').value = livro.quantidade;
            document.getElementById('descricao').value = livro.descricao || '';
            
            function setPreview(base64, previewId, textId) {
                const preview = document.getElementById(previewId);
                const text = document.getElementById(textId);
                if (base64) {
                    preview.src = base64;
                    preview.style.display = 'block';
                    text.style.display = 'none';
                } else {
                    preview.style.display = 'none';
                    text.style.display = 'block';
                }
            }

            capaBase64 = livro.imagem || '';
            capaBase64_2 = livro.imagem2 || '';
            capaBase64_3 = livro.imagem3 || '';

            setPreview(capaBase64, 'previewCapa', 'textCapa');
            setPreview(capaBase64_2, 'previewCapa2', 'textCapa2');
            setPreview(capaBase64_3, 'previewCapa3', 'textCapa3');

            document.getElementById('modalLivro').classList.add('active');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar dados do livro.', 'error');
    }
}

async function excluirLivro(id) {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return;

    try {
        const response = await fetch(`/livros/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
            mostrarNotificacao('Livro excluído com sucesso.');
            carregarLivros();
        } else {
            mostrarNotificacao(data.erro || 'Erro ao excluir livro.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
}
