const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`ALTER TABLE livros ADD COLUMN imagem TEXT`, (err) => {
        if(err) console.log('Coluna imagem ja existe');
        else console.log('Coluna imagem adicionada.');
    });
});
