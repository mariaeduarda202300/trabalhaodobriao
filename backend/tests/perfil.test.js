process.env.JWT_SECRET = 'segredo_de_teste';

jest.mock('../config/db', () => ({
  perfil: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const prisma = require('../config/db');

const USER_A = { id: 'user_a', username: 'aluno_a', email: 'a@exemplo.com' };

function tokenPara(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /me/perfil', () => {
  it('bloqueia acesso sem token', async () => {
    const res = await request(app).post('/me/perfil').send({ nomeCompleto: 'Maria' });
    expect(res.status).toBe(403);
  });

  it('rejeita corpo inválido com 400', async () => {
    const res = await request(app)
      .post('/me/perfil')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('regra de negócio: não permite dois perfis para o mesmo usuário', async () => {
    prisma.perfil.findUnique.mockResolvedValue({ id: 'perfil_1', userId: USER_A.id });

    const res = await request(app)
      .post('/me/perfil')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ nomeCompleto: 'Maria Silva' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/já possui um perfil/i);
    expect(prisma.perfil.create).not.toHaveBeenCalled();
  });

  it('cria o perfil quando o usuário ainda não tem um', async () => {
    prisma.perfil.findUnique.mockResolvedValue(null);
    prisma.perfil.create.mockResolvedValue({ id: 'perfil_1', nomeCompleto: 'Maria Silva', userId: USER_A.id });

    const res = await request(app)
      .post('/me/perfil')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`)
      .send({ nomeCompleto: 'Maria Silva' });

    expect(res.status).toBe(201);
    expect(res.body.nomeCompleto).toBe('Maria Silva');
  });
});

describe('GET /me/perfil', () => {
  it('retorna 404 quando o usuário ainda não tem perfil', async () => {
    prisma.perfil.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/me/perfil')
      .set('Authorization', `Bearer ${tokenPara(USER_A)}`);

    expect(res.status).toBe(404);
  });
});
