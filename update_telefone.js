const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`ALTER TABLE usuarios ADD COLUMN telefone TEXT`, (err) => {
        if(err) console.log('Coluna telefone ja existe');
        else console.log('Coluna telefone adicionada.');
    });
});
