const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Configuração de Middlewares: O cors permite que outras origens acessem a API, e o express.json converte os dados enviados (como as imagens em Base64) para o formato JSON nativo.
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limite aumentado para imagens base64
app.use(express.static(path.join(__dirname, 'public')));

// Conexão e Inicialização do Banco de Dados SQLite: Aqui criamos o arquivo biblioteca.db fisicamente e abrimos a conexão com ele.
const db = new sqlite3.Database('./database/biblioteca.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.serialize(() => {
            // Tabela de Usuários (comum ou admin)
            db.run(`CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                telefone TEXT,
                tipo TEXT DEFAULT 'comum', 
                status TEXT DEFAULT 'ativo',
                avatar TEXT
            )`);

            // Tabela de Livros
            db.run(`CREATE TABLE IF NOT EXISTS livros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                autor TEXT NOT NULL,
                categoria TEXT,
                quantidade INTEGER DEFAULT 1,
                disponiveis INTEGER DEFAULT 1,
                descricao TEXT,
                imagem TEXT,
                imagem2 TEXT,
                imagem3 TEXT
            )`);

            // Tabela de Empréstimos
            db.run(`CREATE TABLE IF NOT EXISTS emprestimos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                livro_id INTEGER,
                data_emprestimo TEXT,
                data_devolucao TEXT,
                status TEXT DEFAULT 'Emprestado',
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY(livro_id) REFERENCES livros(id)
            )`);
            console.log('Tabelas inicializadas com sucesso.');
        });
    }
});

// ======================= ROTAS DE USUÁRIOS (CRUD) =======================
// Estas rotas lidam com a criação, leitura, atualização e exclusão (CRUD) dos usuários no banco.

// Rota de Cadastro de Novos Usuários via Tela de Login
// Recebe os dados do formulário frontend e insere (INSERT) diretamente na tabela "usuarios".
app.post('/cadastro', (req, res) => {
    const { nome, email, senha, telefone } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });

    db.run('INSERT INTO usuarios (nome, email, senha, telefone, tipo, status) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, senha, telefone, 'comum', 'ativo'], function(err) {
        if (err) return res.status(400).json({ erro: 'E-mail já cadastrado.' });
        res.status(201).json({ id: this.lastID, mensagem: 'Usuário cadastrado com sucesso.' });
    });
});

// Admin Post Usuários
app.post('/usuarios', (req, res) => {
    const { nome, email, senha, telefone, tipo, status } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos.' });
    
    db.run('INSERT INTO usuarios (nome, email, senha, telefone, tipo, status) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, senha, telefone, tipo || 'comum', status || 'ativo'], function(err) {
        if (err) return res.status(400).json({ erro: 'E-mail já cadastrado.' });
        res.status(201).json({ id: this.lastID, mensagem: 'Usuário criado' });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.get('SELECT id, nome, email, tipo, avatar, telefone FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, row) => {
        if (err || !row) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        res.json({ mensagem: 'Login realizado com sucesso', usuario: row });
    });
});

// Listar usuários
app.get('/usuarios', (req, res) => {
    db.all(`SELECT id, nome, email, telefone, tipo, status FROM usuarios`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
        res.json(rows);
    });
});

app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT id, nome, email, telefone, tipo, status FROM usuarios WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        res.json(row);
    });
});

// Atualizar Perfil
app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, avatar, telefone } = req.body;
    
    let sql = `UPDATE usuarios SET nome = ?, email = ?, avatar = ?, telefone = ?`;
    let params = [nome, email, avatar, telefone];

    if (senha) {
        sql += `, senha = ?`;
        params.push(senha);
    }
    sql += ` WHERE id = ?`;
    params.push(id);

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
        db.get('SELECT id, nome, email, tipo, avatar, telefone FROM usuarios WHERE id = ?', [id], (err, row) => {
            res.json({ mensagem: 'Perfil atualizado com sucesso.', usuario: row });
        });
    });
});

app.put('/usuarios/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run('UPDATE usuarios SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar status.' });
        res.json({ mensagem: 'Status atualizado com sucesso.' });
    });
});

app.put('/usuarios/:id/tipo', (req, res) => {
    const { id } = req.params;
    const { tipo } = req.body;
    db.run('UPDATE usuarios SET tipo = ? WHERE id = ?', [tipo, id], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar privilégios.' });
        res.json({ mensagem: 'Privilégios atualizados com sucesso.' });
    });
});

app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao excluir usuário.' });
        res.json({ mensagem: 'Usuário excluído com sucesso.' });
    });
});


// ======================= ROTAS DE LIVROS (ACERVO) =======================
// Responsáveis pelo gerenciamento de todo o catálogo da biblioteca digital.

// Listar livros
app.get('/livros', (req, res) => {
    db.all(`SELECT * FROM livros`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar livros.' });
        res.json(rows);
    });
});

// Buscar livro por ID
app.get('/livros/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM livros WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar livro.' });
        if (!row) return res.status(404).json({ erro: 'Livro não encontrado.' });
        res.json(row);
    });
});

// Cadastrar livro
app.post('/livros', (req, res) => {
    const { titulo, autor, categoria, quantidade, descricao, imagem, imagem2, imagem3 } = req.body;
    if (!titulo || !autor || !categoria || quantidade == null) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }

    const qtd = parseInt(quantidade, 10);
    const desc = descricao || 'Nenhuma descrição disponível.';
    const img = imagem || '';
    const sql = `INSERT INTO livros (titulo, autor, categoria, quantidade, disponiveis, descricao, imagem, imagem2, imagem3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [titulo, autor, categoria, qtd, qtd, desc, img, imagem2 || '', imagem3 || ''], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao cadastrar livro.' });
        res.status(201).json({ id: this.lastID, mensagem: 'Livro cadastrado com sucesso.' });
    });
});

// Atualizar livro
app.put('/livros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, categoria, quantidade, descricao, imagem, imagem2, imagem3 } = req.body;

    db.get(`SELECT quantidade, disponiveis, imagem, imagem2, imagem3 FROM livros WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ erro: 'Livro não encontrado.' });

        const diferenca = parseInt(quantidade, 10) - row.quantidade;
        const novosDisponiveis = row.disponiveis + diferenca;
        const desc = descricao || 'Nenhuma descrição disponível.';
        
        // Preserve existing images if not provided in the payload
        const finalImg = imagem !== undefined ? imagem : row.imagem;
        const finalImg2 = imagem2 !== undefined ? imagem2 : row.imagem2;
        const finalImg3 = imagem3 !== undefined ? imagem3 : row.imagem3;

        if (novosDisponiveis < 0) {
            return res.status(400).json({ erro: 'A quantidade total não pode ser menor que o número de livros emprestados.' });
        }

        const sql = `UPDATE livros SET titulo = ?, autor = ?, categoria = ?, quantidade = ?, disponiveis = ?, descricao = ?, imagem = ?, imagem2 = ?, imagem3 = ? WHERE id = ?`;
        db.run(sql, [titulo, autor, categoria, quantidade, novosDisponiveis, desc, finalImg, finalImg2, finalImg3, id], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao atualizar livro.' });
            res.json({ mensagem: 'Livro atualizado com sucesso.' });
        });
    });
});

// Excluir livro
app.delete('/livros/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT disponiveis, quantidade FROM livros WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ erro: 'Livro não encontrado.' });
        if (row.disponiveis < row.quantidade) {
             return res.status(400).json({ erro: 'Não é possível excluir um livro que possui exemplares emprestados.' });
        }

        db.run(`DELETE FROM livros WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao excluir livro.' });
            res.json({ mensagem: 'Livro excluído com sucesso.' });
        });
    });
});

// ======================= ROTAS DE EMPRÉSTIMOS (LÓGICA DE NEGÓCIO) =======================
// O núcleo do sistema: Gerencia a retirada e devolução de livros, alterando o estoque em tempo real.

// Listar empréstimos
app.get('/emprestimos', (req, res) => {
    const sql = `
        SELECT e.id, l.titulo AS livro_titulo, u.nome AS usuario_nome, u.telefone, e.data_emprestimo, e.data_devolucao, e.status, e.livro_id, l.imagem
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN usuarios u ON e.usuario_id = u.id
        ORDER BY e.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar empréstimos.' });
        res.json(rows);
    });
});

// Buscar empréstimos de um usuário específico
app.get('/emprestimos/usuario/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT e.id, l.titulo AS livro, e.data_emprestimo, e.data_devolucao, e.status, e.livro_id, l.imagem
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        WHERE e.usuario_id = ?
        ORDER BY e.id DESC
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar histórico.' });
        res.json(rows);
    });
});

// Criar empréstimo
app.post('/emprestimos', (req, res) => {
    const { usuario_id, livro_id } = req.body;
    
    db.get(`SELECT disponiveis FROM livros WHERE id = ?`, [livro_id], (err, livro) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar livro.' });
        if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
        if (livro.disponiveis <= 0) return res.status(400).json({ erro: 'Não existem exemplares disponíveis para este livro.' });

        const data_emprestimo = new Date().toISOString().split('T')[0];

        db.serialize(() => {
            // Transação (Transaction): Usamos BEGIN TRANSACTION para garantir que o empréstimo e a baixa no estoque ocorram juntos. Se uma falhar, a outra é cancelada (ROLLBACK).
            db.run("BEGIN TRANSACTION");
            const sqlEmprestimo = `INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, status) VALUES (?, ?, ?, 'Emprestado')`;
            db.run(sqlEmprestimo, [usuario_id, livro_id, data_emprestimo], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ erro: 'Erro ao registrar empréstimo.' });
                }

                db.run(`UPDATE livros SET disponiveis = disponiveis - 1 WHERE id = ?`, [livro_id], function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ erro: 'Erro ao atualizar disponibilidade.' });
                    }
                    db.run("COMMIT");
                    res.status(201).json({ mensagem: 'Empréstimo realizado com sucesso.' });
                });
            });
        });
    });
});

// Devolver livro
app.put('/emprestimos/:id/devolver', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT status, livro_id FROM emprestimos WHERE id = ?`, [id], (err, emprestimo) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar empréstimo.' });
        if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
        if (emprestimo.status === 'Devolvido') return res.status(400).json({ erro: 'Livro já foi devolvido.' });

        const data_devolucao = new Date().toISOString().split('T')[0];

        db.serialize(() => {
            // Transação (Transaction): Usamos BEGIN TRANSACTION para garantir que o empréstimo e a baixa no estoque ocorram juntos. Se uma falhar, a outra é cancelada (ROLLBACK).
            db.run("BEGIN TRANSACTION");
            const sqlAtualiza = `UPDATE emprestimos SET status = 'Devolvido', data_devolucao = ? WHERE id = ?`;
            db.run(sqlAtualiza, [data_devolucao, id], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ erro: 'Erro ao registrar devolução.' });
                }

                db.run(`UPDATE livros SET disponiveis = disponiveis + 1 WHERE id = ?`, [emprestimo.livro_id], function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ erro: 'Erro ao atualizar disponibilidade.' });
                    }
                    db.run("COMMIT");
                    res.json({ mensagem: 'Livro devolvido com sucesso.' });
                });
            });
        });
    });
});

// ======================= ROTAS DO DASHBOARD =======================
app.get('/dashboard/stats', (req, res) => {
    const stats = {};
    db.serialize(() => {
        db.get(`SELECT COUNT(*) as total FROM livros`, (err, row) => { stats.total_livros = row ? row.total : 0; });
        db.get(`SELECT COUNT(*) as disponiveis FROM livros WHERE disponiveis > 0`, (err, row) => { stats.livros_disponiveis = row && row.disponiveis ? row.disponiveis : 0; });
        db.get(`SELECT COUNT(*) as emprestados FROM emprestimos WHERE status = 'Emprestado'`, (err, row) => { stats.livros_emprestados = row ? row.emprestados : 0; });
        db.get(`SELECT COUNT(*) as usuarios FROM usuarios`, (err, row) => { 
            stats.total_usuarios = row ? row.usuarios : 0; 
            res.json(stats);
        });
    });
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} - http://localhost:${PORT}`);
});