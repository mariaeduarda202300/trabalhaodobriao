process.env.JWT_SECRET = 'segredo_de_teste';

// Mocka o cliente Prisma para não depender de um banco real durante os testes.
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
}));

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const prisma = require('../config/db');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /register', () => {
  it('rejeita corpo inválido com 400', async () => {
    const res = await request(app).post('/register').send({ email: '', username: '', password: '' });
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('cria usuário e nunca devolve a senha', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user_1',
      email: 'aluno@exemplo.com',
      username: 'aluno1',
      password: 'hash-super-secreto',
    });

    const res = await request(app)
      .post('/register')
      .send({ email: 'aluno@exemplo.com', username: 'aluno1', password: '1234' });

    expect(res.status).toBe(201);
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user.username).toBe('aluno1');
  });

  it('retorna 400 quando usuário/e-mail já existe (erro P2002 do Prisma)', async () => {
    const erro = new Error('Unique constraint');
    erro.code = 'P2002';
    prisma.user.create.mockRejectedValue(erro);

    const res = await request(app)
      .post('/register')
      .send({ email: 'aluno@exemplo.com', username: 'aluno1', password: '1234' });

    expect(res.status).toBe(400);
  });
});

describe('POST /login', () => {
  it('retorna 401 quando o usuário não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/login').send({ username: 'ninguem', password: '1234' });

    expect(res.status).toBe(401);
  });

  it('retorna 401 quando a senha está incorreta', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      username: 'aluno1',
      email: 'aluno@exemplo.com',
      password: senhaHash,
    });

    const res = await request(app).post('/login').send({ username: 'aluno1', password: 'senha-errada' });

    expect(res.status).toBe(401);
  });

  it('retorna um token JWT quando as credenciais são válidas', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      username: 'aluno1',
      email: 'aluno@exemplo.com',
      password: senhaHash,
    });

    const res = await request(app).post('/login').send({ username: 'aluno1', password: 'senha-correta' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });
});
