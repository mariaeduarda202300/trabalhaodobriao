process.env.JWT_SECRET = 'segredo_de_teste';

jest.mock('../config/db', () => ({
  book: {
    findUnique: jest.fn(),
  },
  emprestimo: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
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

const livro = { id: 'book_1', titulo: 'Dom Casmurro', isbn: '123', descricao: 'Clássico', quantidade: 2 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /emprestimos', () => {
  it('bloqueia acesso sem token', async () => {
    const res = await request(app).post('/emprestimos').send({ bookId: 'book_1' });
    expect(res.status).toBe(403);
  });

  it('rejeita corpo inválido com 400', async () => {
    const res = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({});

    expect(res.status).toBe(400);
    expect(prisma.emprestimo.create).not.toHaveBeenCalled();
  });

  it('retorna 404 quando o livro não existe', async () => {
    prisma.book.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ bookId: 'nao-existe', dataDevolucaoPrevista: '2026-09-20' });

    expect(res.status).toBe(404);
  });

  it('regra de negócio: rejeita empréstimo sem exemplares disponíveis', async () => {
    prisma.book.findUnique.mockResolvedValue(livro);
    prisma.emprestimo.count.mockResolvedValue(2); // já emprestados == quantidade total

    const res = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ bookId: 'book_1', dataDevolucaoPrevista: '2026-09-20' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/disponíveis/i);
    expect(prisma.emprestimo.create).not.toHaveBeenCalled();
  });

  it('cria o empréstimo quando há exemplares disponíveis', async () => {
    prisma.book.findUnique.mockResolvedValue(livro);
    prisma.emprestimo.count.mockResolvedValue(0);
    prisma.emprestimo.create.mockResolvedValue({
      id: 'emp_1',
      bookId: 'book_1',
      userId: USER_A.id,
      status: 'ABERTO',
    });

    const res = await request(app)
      .post('/emprestimos')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ bookId: 'book_1', dataDevolucaoPrevista: '2026-09-20' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ABERTO');
  });
});

describe('PUT /emprestimos/:id/devolver', () => {
  it('impede que outro usuário devolva o empréstimo (403)', async () => {
    prisma.emprestimo.findUnique.mockResolvedValue({ id: 'emp_1', userId: USER_A.id, status: 'ABERTO' });

    const res = await request(app)
      .put('/emprestimos/emp_1/devolver')
      .set('Authorization', `Bearer ${tokenPara(USER_B)}`);

    expect(res.status).toBe(403);
    expect(prisma.emprestimo.update).not.toHaveBeenCalled();
  });

  it('rejeita devolver um empréstimo já devolvido', async () => {
    prisma.emprestimo.findUnique.mockResolvedValue({ id: 'emp_1', userId: USER_A.id, status: 'DEVOLVIDO' });

    const res = await request(app)
      .put('/emprestimos/emp_1/devolver')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`);

    expect(res.status).toBe(400);
  });

  it('permite que o dono devolva o próprio empréstimo', async () => {
    prisma.emprestimo.findUnique.mockResolvedValue({ id: 'emp_1', userId: USER_A.id, status: 'ABERTO' });
    prisma.emprestimo.update.mockResolvedValue({ id: 'emp_1', userId: USER_A.id, status: 'DEVOLVIDO' });

    const res = await request(app)
      .put('/emprestimos/emp_1/devolver')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DEVOLVIDO');
  });
});
