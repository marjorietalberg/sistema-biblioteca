const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath);

const livrosTestes = [
    { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", categoria: "Literatura Clássica", quantidade: 5 },
    { titulo: "1984", autor: "George Orwell", categoria: "Ficção Científica", quantidade: 3 },
    { titulo: "Sapiens: Uma Breve História da Humanidade", autor: "Yuval Noah Harari", categoria: "História", quantidade: 4 },
    { titulo: "Código Limpo (Clean Code)", autor: "Robert C. Martin", categoria: "Tecnologia", quantidade: 2 },
    { titulo: "O Senhor dos Anéis: A Sociedade do Anel", autor: "J.R.R. Tolkien", categoria: "Fantasia", quantidade: 6 },
    { titulo: "Hábitos Atômicos", autor: "James Clear", categoria: "Desenvolvimento Pessoal", quantidade: 8 },
    { titulo: "Dom Quixote", autor: "Miguel de Cervantes", categoria: "Romance Clássico", quantidade: 1 },
    { titulo: "A Arte da Guerra", autor: "Sun Tzu", categoria: "Estratégia", quantidade: 3 }
];

db.serialize(() => {
    livrosTestes.forEach(livro => {
        db.run(`INSERT INTO livros (titulo, autor, categoria, quantidade, disponiveis) VALUES (?, ?, ?, ?, ?)`, 
        [livro.titulo, livro.autor, livro.categoria, livro.quantidade, livro.quantidade]);
    });
});

console.log("Livros de teste inseridos com sucesso!");
db.close();
