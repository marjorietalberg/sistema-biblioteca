const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath);

const livros = [
    {
        titulo: 'O Pequeno Príncipe',
        autor: 'Antoine de Saint-Exupéry',
        categoria: 'Literatura Clássica',
        quantidade: 5,
        descricao: 'Le Petit Prince é uma novela do escritor, aviador aristocrata francês Antoine de Saint-Exupéry, originalmente publicada em inglês e francês em abril de 1943. É uma obra poética com ilustrações em aquarela feitas pelo autor.',
        imagem: '/livros/pequenoprincipe.jpg',
        imagem2: '/livros/pequenoprincipe2.jpg',
        imagem3: '/livros/pequenoprincipe3.jpg'
    },
    {
        titulo: 'É Assim Que Acaba',
        autor: 'Colleen Hoover',
        categoria: 'Romance',
        quantidade: 8,
        descricao: 'Lily nem sempre teve uma vida fácil, mas isso nunca a impediu de trabalhar arduamente para conquistar a vida tão sonhada. É um romance poderoso que aborda questões complexas como violência doméstica com bastante sensibilidade.',
        imagem: '/livros/assimqueacaba1.jpg',
        imagem2: '/livros/assimqueacaba2.jpg',
        imagem3: '/livros/assimqueacaba3.jpg'
    }
];

db.serialize(() => {
    const stmt = db.prepare(`INSERT INTO livros (titulo, autor, categoria, quantidade, disponiveis, descricao, imagem, imagem2, imagem3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    livros.forEach(livro => {
        stmt.run([livro.titulo, livro.autor, livro.categoria, livro.quantidade, livro.quantidade, livro.descricao, livro.imagem, livro.imagem2, livro.imagem3], function(err) {
            if (err) console.error('Erro ao inserir:', err);
            else console.log(`Livro inserido com sucesso: ${livro.titulo}`);
        });
    });
    
    stmt.finalize();
});
