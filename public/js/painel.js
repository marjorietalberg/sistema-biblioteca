document.addEventListener('DOMContentLoaded', () => {
    const userStr = sessionStorage.getItem('usuario');
    if (!userStr) return;

    const usuario = JSON.parse(userStr);
    
    // Preenche as informações do perfil
    document.getElementById('nomeUsuario').textContent = usuario.nome;
    document.getElementById('emailUsuario').textContent = usuario.email;
    document.getElementById('contaNome').textContent = usuario.nome;
    document.getElementById('contaEmail').textContent = usuario.email;
    if(usuario.telefone) document.getElementById('contaTelefone').textContent = usuario.telefone;
    
    if (usuario.avatar) {
        document.getElementById('avatarLetra').style.display = 'none';
        const img = document.getElementById('avatarImg');
        img.src = usuario.avatar;
        img.style.display = 'block';
    } else {
        document.getElementById('avatarLetra').textContent = usuario.nome.charAt(0).toUpperCase();
    }

    carregarHistorico(usuario.id);

    const fecharAv = document.getElementById('fecharModalAvaliacao');
    if(fecharAv) fecharAv.addEventListener('click', () => document.getElementById('modalAvaliacao').classList.remove('active'));

    const btnEnviar = document.getElementById('btnEnviarAvaliacao');
    if(btnEnviar) {
        btnEnviar.addEventListener('click', () => {
            mostrarNotificacao('Obrigado! Sua avaliação foi registrada com sucesso.', 'success');
            document.getElementById('modalAvaliacao').classList.remove('active');
        });
    }

    // Lógica de Editar Perfil
    const btnEditar = document.getElementById('btnEditarPerfil');
    const modalPerfil = document.getElementById('modalPerfil');
    const fecharPerfil = document.getElementById('fecharModalPerfil');
    const formPerfil = document.getElementById('formPerfil');
    const inputAvatar = document.getElementById('inputAvatar');
    const previewAvatar = document.getElementById('previewAvatar');
    const textAvatar = document.getElementById('textAvatar');
    let avatarBase64 = usuario.avatar || '';

    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            document.getElementById('editNome').value = usuario.nome;
            document.getElementById('editEmail').value = usuario.email;
            document.getElementById('editTelefone').value = usuario.telefone || '';
            document.getElementById('editSenha').value = '';
            
            if (usuario.avatar) {
                previewAvatar.src = usuario.avatar;
                previewAvatar.style.display = 'block';
                textAvatar.style.display = 'none';
            }
            modalPerfil.classList.add('active');
        });
    }

    if (fecharPerfil) fecharPerfil.addEventListener('click', () => modalPerfil.classList.remove('active'));

    if (inputAvatar) {
        inputAvatar.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    avatarBase64 = evt.target.result;
                    previewAvatar.src = avatarBase64;
                    previewAvatar.style.display = 'block';
                    textAvatar.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('editNome').value;
            const email = document.getElementById('editEmail').value;
            const telefone = document.getElementById('editTelefone').value;
            const senha = document.getElementById('editSenha').value;

            try {
                const res = await fetch(`/usuarios/${usuario.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, avatar: avatarBase64, telefone })
                });
                const data = await res.json();

                if (res.ok) {
                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                    mostrarNotificacao(data.mensagem, 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    mostrarNotificacao(data.erro, 'error');
                }
            } catch (error) {
                mostrarNotificacao('Erro de conexão.', 'error');
            }
        });
    }
});

async function carregarHistorico(idUsuario) {
    try {
        const response = await fetch('/emprestimos/usuario/' + idUsuario);
        if (response.ok) {
            const emprestimos = await response.json();
            const container = document.getElementById('listaLivros');
            container.innerHTML = '';

            let ativos = 0;
            let lidos = 0;

            if (emprestimos.length === 0) {
                container.innerHTML = '<div style="padding: 60px; text-align: center; background: white; border-radius: 20px; border: 2px dashed #cbd5e1; color: #64748b; font-size: 16px; font-weight: 500;">Você ainda não pegou nenhum livro. Explore o catálogo!</div>';
                return;
            }

            emprestimos.forEach(emp => {
                if (emp.status === 'Emprestado') ativos++;
                else lidos++;

                const dataFormatada = emp.data_emprestimo.split('-').reverse().join('/');
                
                let badgeHTML = '';
                let contentHTML = '';

                if (emp.status === 'Emprestado') {
                    badgeHTML = '<div class="book-badge badge-reading"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg> Lendo Agora</div>';
                    contentHTML = '<div class="book-dates">' +
                                  '<p>Retirado em: <span>' + dataFormatada + '</span></p>' +
                                  '<p style="color: #d97706; margin-top: 4px;">Aguardando devolução no balcão</p>' +
                                  '</div>';
                } else {
                    badgeHTML = '<div class="book-badge badge-returned"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Devolvido</div>';
                    contentHTML = '<div class="book-dates">' +
                                  '<p>Retirado em: <span>' + dataFormatada + '</span></p>' +
                                  '<p>Devolvido em: <span>' + emp.data_devolucao.split('-').reverse().join('/') + '</span></p>' +
                                  '</div>' +
                                  '<button class="btn-feedback" onclick="abrirAvaliacao()">' +
                                  '<span class="feedback-stars"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>' +
                                  'Dar Feedback' +
                                  '</button>';
                }

                let cover = emp.imagem;
                if (!cover) {
                    if (emp.livro.includes('Pequeno')) cover = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop';
                    else if (emp.livro.includes('Acaba')) cover = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop';
                    else cover = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200&auto=format&fit=crop';
                }

                container.innerHTML += '<div class="book-list-item">' +
                                       '<img src="' + cover + '" alt="Capa">' +
                                       '<div class="book-info">' +
                                       badgeHTML +
                                       '<h4 class="book-title">' + emp.livro + '</h4>' +
                                       '<div class="book-id">ID do Empréstimo: #' + emp.id + '</div>' +
                                       contentHTML +
                                       '</div>' +
                                       '</div>';
            });

            document.getElementById('statAtivos').textContent = ativos;
            document.getElementById('statLidos').textContent = lidos;
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar histórico.', 'error');
    }
}

function abrirAvaliacao() {
    document.getElementById('modalAvaliacao').classList.add('active');
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach(s => {
        s.addEventListener('click', function() {
            let val = parseInt(this.getAttribute('data-val'));
            stars.forEach(st => st.style.color = '#e2e8f0');
            for(let i=0; i<val; i++) {
                stars[i].style.color = '#fbbf24';
            }
        });
    });
}
