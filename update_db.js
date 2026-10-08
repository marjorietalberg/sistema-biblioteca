const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`ALTER TABLE livros ADD COLUMN descricao TEXT DEFAULT 'Nenhuma descrição disponível.'`, (err) => {
        if(err) console.log('Coluna descricao ja existe', err.message);
        else console.log('Coluna descricao adicionada.');
    });
    db.run(`ALTER TABLE usuarios ADD COLUMN tipo TEXT DEFAULT 'leitor'`, (err) => {
        if(err) console.log('Coluna tipo ja existe', err.message);
        else console.log('Coluna tipo adicionada.');
    });
    db.run(`INSERT INTO usuarios (nome, email, senha, tipo) VALUES ('Administrador', 'admin@biblioteca.com', 'admin123', 'admin')`, (err) => {
        if(err) console.log('Admin ja existe', err.message);
        else console.log('Usuario admin criado com sucesso.');
    });
});
