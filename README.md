# Biblioteca Digital

Um sistema web completo, simples e moderno para gerenciamento de bibliotecas, desenvolvido como atividade acadêmica.

## Tecnologias

* **Front-end:** HTML5, CSS3, JavaScript puro (Vanilla JS), Fetch API
* **Back-end:** Node.js, Express.js
* **Banco de Dados:** SQLite (`sqlite3`)

## Instalação

Pré-requisito: Ter o Node.js instalado no computador.

1. Navegue até a pasta do projeto:
   ```bash
   cd biblioteca-digital
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Executar

1. Inicie o servidor:
   ```bash
   node server.js
   ```

2. Acesse a aplicação no navegador:
   ```text
   http://localhost:3000
   ```
   *(O banco de dados SQLite e suas tabelas serão criados automaticamente na primeira execução do servidor).*

## Estrutura do Projeto

* `server.js` - Arquivo principal contendo toda a lógica do back-end (Express) e integração com o banco (SQLite).
* `database/` - Contém o arquivo do banco de dados `biblioteca.db`.
* `public/` - Arquivos estáticos servidos pelo Express (Front-end).
  * `css/` - Estilos (UI moderna, minimalista).
  * `js/` - Lógica de interface e comunicação via `fetch()`.
  * `*.html` - Páginas do sistema (Login, Cadastro, Dashboard, Livros, Empréstimos).

## Principais Rotas da API

* `POST /cadastro` - Cadastra um novo usuário.
* `POST /login` - Realiza a autenticação simples (verifica e-mail/senha).
* `GET /livros`, `POST /livros`, `PUT /livros/:id`, `DELETE /livros/:id` - CRUD completo de livros.
* `GET /emprestimos`, `POST /emprestimos` - Gestão de empréstimos (verifica disponibilidade).
* `PUT /emprestimos/:id/devolver` - Devolve um livro e restaura sua disponibilidade.
* `GET /dashboard/stats` - Retorna os dados estatísticos para preencher o Dashboard.
