process.env.JWT_SECRET = 'segredo_de_teste';

jest.mock('../config/db', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  book: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bookAuthor: {
    deleteMany: jest.fn(),
  },
  emprestimo: {
    findFirst: jest.fn(),
  },
  reserva: {
    findFirst: jest.fn(),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const prisma = require('../config/db');

const USER_A = { id: 'user_a', username: 'aluno_a', email: 'a@exemplo.com' };
const USER_B = { id: 'user_b', username: 'aluno_b', email: 'b@exemplo.com' };

function tokenPara(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const livroValido = {
  titulo: 'O Senhor dos Anéis',
  isbn: '9780261103573',
  descricao: 'Fantasia épica',
  quantidade: 3,
  authorIds: ['author_1'],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Autenticação nas rotas de livros', () => {
  it('bloqueia acesso sem token', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(403);
  });

  it('bloqueia acesso com token inválido', async () => {
    const res = await request(app).get('/api/books').set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(403);
  });
});

describe('POST /api/books', () => {
  it('rejeita corpo inválido com 400', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ titulo: '' });

    expect(res.status).toBe(400);
    expect(prisma.book.create).not.toHaveBeenCalled();
  });

  it('cria o livro vinculado ao usuário autenticado', async () => {
    prisma.book.create.mockResolvedValue({ id: 'book_1', ...livroValido, userId: USER_A.id });

    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send(livroValido);

    expect(res.status).toBe(201);
    expect(prisma.book.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: USER_A.id }) })
    );
  });

  it('retorna 400 quando o ISBN já existe (erro P2002 do Prisma)', async () => {
    const erro = new Error('Unique constraint');
    erro.code = 'P2002';
    prisma.book.create.mockRejectedValue(erro);

    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send(livroValido);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/me/books', () => {
  it('lista apenas os livros do usuário autenticado', async () => {
    prisma.book.findMany.mockResolvedValue([{ id: 'book_1', ...livroValido, userId: USER_A.id }]);

    const res = await request(app)
      .get('/api/me/books')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`);

    expect(res.status).toBe(200);
    expect(prisma.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_A.id } })
    );
  });
});

describe('PUT /api/books/:id', () => {
  it('impede que um usuário edite o livro de outro usuário (403)', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 'book_1', ...livroValido, userId: USER_A.id });

    const res = await request(app)
      .put('/api/books/book_1')
      .set('Authorization', `Bearer ${tokenPara(USER_B)}`)
      .send(livroValido);

    expect(res.status).toBe(403);
    expect(prisma.book.update).not.toHaveBeenCalled();
  });

  it('permite que o dono edite o próprio livro', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 'book_1', ...livroValido, userId: USER_A.id });
    prisma.book.update.mockResolvedValue({ id: 'book_1', ...livroValido, titulo: 'Novo título', userId: USER_A.id });

    const res = await request(app)
      .put('/api/books/book_1')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ ...livroValido, titulo: 'Novo título' });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Novo título');
  });

  it('retorna 404 quando o livro não existe', async () => {
    prisma.book.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/books/nao-existe')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send(livroValido);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/books/:id', () => {
  it('impede que um usuário exclua o livro de outro usuário (403)', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 'book_1', ...livroValido, userId: USER_A.id });

    const res = await request(app)
      .delete('/api/books/book_1')
      .set('Authorization', `Bearer ${tokenPara(USER_B)}`);

    expect(res.status).toBe(403);
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('permite que o dono exclua o próprio livro', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: 'book_1', ...livroValido, userId: USER_A.id });
    prisma.book.delete.mockResolvedValue({ id: 'book_1', ...livroValido, userId: USER_A.id });

    const res = await request(app)
      .delete('/api/books/book_1')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`);

    expect(res.status).toBe(200);
  });
});
