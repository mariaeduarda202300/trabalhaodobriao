process.env.JWT_SECRET = 'segredo_de_teste';

jest.mock('../config/db', () => ({
  book: {
    findUnique: jest.fn(),
  },
  reserva: {
    findFirst: jest.fn(),
    create: jest.fn(),
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

const livro = { id: 'book_1', titulo: 'Dom Casmurro', isbn: '123', descricao: 'Clássico', quantidade: 1 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /reservas', () => {
  it('bloqueia acesso sem token', async () => {
    const res = await request(app).post('/reservas').send({ bookId: 'book_1' });
    expect(res.status).toBe(403);
  });

  it('rejeita corpo inválido com 400', async () => {
    const res = await request(app)
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('retorna 404 quando o livro não existe', async () => {
    prisma.book.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ bookId: 'nao-existe' });

    expect(res.status).toBe(404);
  });

  it('regra de negócio: rejeita reserva duplicada do mesmo usuário para o mesmo livro', async () => {
    prisma.book.findUnique.mockResolvedValue(livro);
    prisma.reserva.findFirst.mockResolvedValue({ id: 'reserva_1', status: 'ATIVA' });

    const res = await request(app)
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ bookId: 'book_1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/já possui uma reserva ativa/i);
    expect(prisma.reserva.create).not.toHaveBeenCalled();
  });

  it('cria a reserva quando o usuário ainda não tem uma reserva ativa para o livro', async () => {
    prisma.book.findUnique.mockResolvedValue(livro);
    prisma.reserva.findFirst.mockResolvedValue(null);
    prisma.reserva.create.mockResolvedValue({ id: 'reserva_1', bookId: 'book_1', userId: USER_A.id, status: 'ATIVA' });

    const res = await request(app)
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ bookId: 'book_1' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ATIVA');
  });
});

describe('PUT /reservas/:id/cancelar', () => {
  it('impede que outro usuário cancele a reserva (403)', async () => {
    prisma.reserva.findUnique.mockResolvedValue({ id: 'reserva_1', userId: USER_A.id, status: 'ATIVA' });

    const res = await request(app)
      .put('/reservas/reserva_1/cancelar')
      .set('Authorization', `Bearer ${tokenPara(USER_B)}`);

    expect(res.status).toBe(403);
    expect(prisma.reserva.update).not.toHaveBeenCalled();
  });

  it('permite que o dono cancele a própria reserva', async () => {
    prisma.reserva.findUnique.mockResolvedValue({ id: 'reserva_1', userId: USER_A.id, status: 'ATIVA' });
    prisma.reserva.update.mockResolvedValue({ id: 'reserva_1', userId: USER_A.id, status: 'CANCELADA' });

    const res = await request(app)
      .put('/reservas/reserva_1/cancelar')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELADA');
  });
});
