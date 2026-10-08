let livrosCachePublico = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarCatalogo();
    
    const inputPesquisa = document.getElementById('inputPesquisaPublica');
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', filtrarCatalogo);
    }
    
    // Se o usuário já estiver logado, altera o menu
    if (sessionStorage.getItem('usuario')) {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        const linkPainel = usuario.tipo === 'admin' ? 'dashboard.html' : 'painel.html';
        const nomeBotao = usuario.tipo === 'admin' ? 'Área Admin' : 'Meu Painel';

        const menu = document.getElementById('menuPublico');
        menu.innerHTML = `
            <a href="${linkPainel}" class="btn btn-primary" style="width: auto; padding: 8px 20px; font-size: 12px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; height: 36px; line-height: 1;">${nomeBotao}</a>
            <a href="#" onclick="sessionStorage.removeItem('usuario'); window.location.reload();" style="margin-left: 16px; font-weight: 600; font-size: 13px; text-transform: uppercase; color: var(--text-muted); display: inline-flex; align-items: center;">Sair</a>
        `;
    }
});

async function carregarCatalogo() {
    try {
        const response = await fetch('/livros');
        if (response.ok) {
            livrosCachePublico = await response.json();
            renderizarCatalogo(livrosCachePublico);
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar catálogo.', 'error');
    }
}


function renderizarCatalogo(livros) {
    const grid = document.getElementById('gridLivrosPublica');
    const countElem = document.getElementById('catalogCount');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (countElem) {
        countElem.textContent = `${livros.length} ${livros.length === 1 ? 'livro encontrado' : 'livros encontrados'}`;
    }

    if (livros.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 60px 0; font-size: 18px;">Nenhum livro disponível no momento.</p>';
        return;
    }

    livros.forEach(livro => {
        const div = document.createElement('div');
        div.className = 'modern-book-card';
        div.onclick = () => abrirDetalhes(livro);
        
        let statusBadge = '';
        if (livro.disponiveis > 0) {
            statusBadge = `<span class="modern-status available">Disponível</span>`;
        } else {
            statusBadge = `<span class="modern-status unavailable">Indisponível</span>`;
        }

        const randomScore = (4 + (livro.id % 10) / 10).toFixed(1);
        const reviewsCount = 10 + (livro.id * 7);
        const starsHtml = `
            <div class="modern-stars">
                ★★★★★<span style="color: #e2e8f0; position:absolute; left:0; overflow:hidden; width:80%;">★★★★★</span>
                <span class="modern-rating-text">${randomScore} (${reviewsCount})</span>
            </div>
        `;

        const imgUrl = livro.imagem || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop';

        div.innerHTML = `
            <div class="modern-book-cover-wrapper">
                <img src="${imgUrl}" alt="Capa de Livro" class="modern-book-cover">
                <div class="modern-book-badge">${statusBadge}</div>
            </div>
            <div class="modern-book-info">
                <div class="modern-book-category">${livro.categoria}</div>
                <h3 class="modern-book-title">${livro.titulo}</h3>
                ${starsHtml}
                <div class="modern-book-author">Por ${livro.autor}</div>
            </div>
        `;
        grid.appendChild(div);
    });
}

function abrirDetalhes(livro) {
    document.getElementById('detalheTitulo').textContent = livro.titulo;
    document.getElementById('detalheAutor').textContent = `Por ${livro.autor}`;
    document.getElementById('detalheCategoria').textContent = livro.categoria;
    document.getElementById('detalheDescricao').textContent = livro.descricao || 'Nenhuma descrição disponível.';
    
    // Set Image Gallery
    const modalImg = document.getElementById('modalImagemPrincipal');
    const modalGaleria = document.getElementById('modalGaleria');
    const imagens = [];
    
    if (livro.imagem) imagens.push(livro.imagem);
    if (livro.imagem2) imagens.push(livro.imagem2);
    if (livro.imagem3) imagens.push(livro.imagem3);
    
    if (imagens.length === 0) {
        imagens.push('https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop');
    }

    if (modalImg) modalImg.src = imagens[0];
    
    if (modalGaleria) {
        modalGaleria.innerHTML = '';
        if (imagens.length > 1) {
            imagens.forEach(imgUrl => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl;
                thumb.style.cssText = 'width: 40px; height: 50px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s;';
                thumb.onclick = () => {
                    modalImg.src = imgUrl;
                    Array.from(modalGaleria.children).forEach(c => c.style.borderColor = 'transparent');
                    thumb.style.borderColor = 'var(--primary-color)';
                };
                modalGaleria.appendChild(thumb);
            });
            // highlight first
            modalGaleria.children[0].style.borderColor = 'var(--primary-color)';
        }
    }
    
    const randomScore = (4 + (livro.id % 10) / 10).toFixed(1);
    const reviewsCount = 10 + (livro.id * 7);
    document.getElementById('detalheEstrelas').innerHTML = `
        ★★★★<span style="color: #e2e8f0;">★</span> 
        <span class="rating-text">${randomScore} (${reviewsCount} avaliações)</span>
    `;

    const dispElem = document.getElementById('detalheDisponibilidade');
    if (livro.disponiveis > 0) {
        dispElem.innerHTML = `<div class="status-box available"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Disponível — ${livro.disponiveis} exemplar(es)</span></div>`;
    } else {
        dispElem.innerHTML = `<div class="status-box unavailable"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><span>Indisponível no momento</span></div>`;
    }

    const btnEmprestar = document.getElementById('btnEmprestar');
    if (livro.disponiveis > 0) {
        btnEmprestar.style.display = 'block';
        btnEmprestar.onclick = () => realizarEmprestimo(livro.id);
    } else {
        btnEmprestar.style.display = 'none';
    }

    document.getElementById('modalDetalhes').classList.add('show'); document.body.style.overflow = 'hidden';
}

document.addEventListener('DOMContentLoaded', () => {
    // ... existing DOMContentLoaded code will run via another block or we just append the listeners here
    const fechar = document.getElementById('fecharModalDetalhes');
    if (fechar) fechar.addEventListener('click', () => { document.getElementById('modalDetalhes').classList.remove('show'); document.body.style.overflow = ''; });
    
    const backdrop = document.getElementById('fecharModalBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => { document.getElementById('modalDetalhes').classList.remove('show'); document.body.style.overflow = ''; });
    const btnCanc = document.getElementById('btnCancelarDetalhes');
    if (btnCanc) btnCanc.addEventListener('click', () => { document.getElementById('modalDetalhes').classList.remove('show'); document.body.style.overflow = ''; });
});

async function realizarEmprestimo(livroId) {
    const userStr = sessionStorage.getItem('usuario');
    if (!userStr) {
        window.location.href = '/login.html';
        return;
    }

    const usuario = JSON.parse(userStr);

    try {
        const response = await fetch('/emprestimos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ livro_id: livroId, usuario_id: usuario.id })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacao('Empréstimo realizado com sucesso!', 'success');
            document.getElementById('modalDetalhes').classList.remove('show'); document.body.style.overflow = '';;
            carregarCatalogo(); // Atualiza a lista
        } else {
            mostrarNotificacao(data.erro || 'Erro ao realizar empréstimo.', 'error');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao conectar com o servidor.', 'error');
    }
}

function filtrarCatalogo(e) {
    const termo = e.target.value.toLowerCase();
    const filtrados = livrosCachePublico.filter(l => 
        l.titulo.toLowerCase().includes(termo) || 
        l.autor.toLowerCase().includes(termo) ||
        l.categoria.toLowerCase().includes(termo)
    );
    renderizarCatalogo(filtrados);
}

document.addEventListener('DOMContentLoaded', () => {
    const filterCat = document.getElementById('filterCategoria');
    const filterDisp = document.getElementById('filterDisponibilidade');
    
    function applyFilters() {
        if (!window.livrosCachePublico) return;
        let filtrados = window.livrosCachePublico;
        const cat = filterCat ? filterCat.value : '';
        const disp = filterDisp ? filterDisp.value : '';
        const busca = document.getElementById('inputPesquisaPublica').value.toLowerCase();
        
        if (cat) filtrados = filtrados.filter(l => l.categoria === cat);
        if (disp === 'disponivel') filtrados = filtrados.filter(l => l.disponiveis > 0);
        if (busca) {
            filtrados = filtrados.filter(l => 
                l.titulo.toLowerCase().includes(busca) || 
                l.autor.toLowerCase().includes(busca) ||
                l.categoria.toLowerCase().includes(busca)
            );
        }
        renderizarCatalogo(filtrados);
    }

    const searchInput = document.getElementById('inputPesquisaPublica');
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    // Custom Dropdowns Logic
    let currentCat = "";
    let currentDisp = "";

    function applyCustomFilters() {
        if (!window.livrosCachePublico) return;
        let filtrados = window.livrosCachePublico;
        const busca = searchInput ? searchInput.value.toLowerCase() : '';
        
        if (currentCat) filtrados = filtrados.filter(l => l.categoria === currentCat);
        if (currentDisp === 'disponivel') filtrados = filtrados.filter(l => l.disponiveis > 0);
        if (busca) {
            filtrados = filtrados.filter(l => 
                l.titulo.toLowerCase().includes(busca) || 
                l.autor.toLowerCase().includes(busca) ||
                l.categoria.toLowerCase().includes(busca)
            );
        }
        renderizarCatalogo(filtrados);
    }

    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const header = dropdown.querySelector('.dropdown-header');
        const selected = dropdown.querySelector('.dropdown-selected');
        const items = dropdown.querySelectorAll('.dropdown-item');

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                selected.textContent = item.textContent;
                
                if (dropdown.id === 'dropdownCategoria') {
                    currentCat = item.getAttribute('data-value');
                } else if (dropdown.id === 'dropdownDisponibilidade') {
                    currentDisp = item.getAttribute('data-value');
                }
                
                dropdown.classList.remove('open');
                applyCustomFilters();
            });
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
    });
});
