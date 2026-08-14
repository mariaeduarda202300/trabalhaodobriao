const {
  validarRegistroUsuario,
  validarLogin,
  validarLivro,
} = require('../utils/validations');

describe('validarRegistroUsuario', () => {
  it('aceita dados válidos', () => {
    const erros = validarRegistroUsuario({
      email: 'aluno@exemplo.com',
      username: 'aluno1',
      password: '1234',
    });
    expect(erros).toHaveLength(0);
  });

  it('rejeita e-mail inválido', () => {
    const erros = validarRegistroUsuario({
      email: 'nao-e-um-email',
      username: 'aluno1',
      password: '1234',
    });
    expect(erros).toContain('E-mail inválido.');
  });

  it('rejeita username curto demais', () => {
    const erros = validarRegistroUsuario({
      email: 'aluno@exemplo.com',
      username: 'ab',
      password: '1234',
    });
    expect(erros).toContain('Usuário deve ter pelo menos 3 caracteres.');
  });

  it('rejeita senha curta demais', () => {
    const erros = validarRegistroUsuario({
      email: 'aluno@exemplo.com',
      username: 'aluno1',
      password: '12',
    });
    expect(erros).toContain('Senha deve ter pelo menos 4 caracteres.');
  });

  it('acumula todos os erros ao mesmo tempo', () => {
    const erros = validarRegistroUsuario({ email: '', username: '', password: '' });
    expect(erros).toHaveLength(3);
  });
});

describe('validarLogin', () => {
  it('aceita usuário e senha presentes', () => {
    expect(validarLogin({ username: 'aluno1', password: '1234' })).toHaveLength(0);
  });

  it('rejeita quando falta usuário ou senha', () => {
    expect(validarLogin({ username: '', password: '' })).toHaveLength(2);
  });
});

describe('validarLivro', () => {
  const livroValido = {
    titulo: 'O Senhor dos Anéis',
    autor: 'J.R.R. Tolkien',
    isbn: '9780261103573',
    descricao: 'Fantasia épica',
    quantidade: 3,
  };

  it('aceita um livro com todos os campos válidos', () => {
    expect(validarLivro(livroValido)).toHaveLength(0);
  });

  it('rejeita quando falta o título', () => {
    const erros = validarLivro({ ...livroValido, titulo: '' });
    expect(erros).toContain('Título é obrigatório.');
  });

  it('rejeita quantidade negativa', () => {
    const erros = validarLivro({ ...livroValido, quantidade: -1 });
    expect(erros).toContain('Quantidade deve ser um número inteiro maior ou igual a zero.');
  });

  it('rejeita quantidade quebrada (não inteira)', () => {
    const erros = validarLivro({ ...livroValido, quantidade: 1.5 });
    expect(erros).toContain('Quantidade deve ser um número inteiro maior ou igual a zero.');
  });

  it('rejeita quantidade ausente', () => {
    const erros = validarLivro({ ...livroValido, quantidade: undefined });
    expect(erros).toContain('Quantidade deve ser um número inteiro maior ou igual a zero.');
  });

  it('aceita quantidade zero', () => {
    const erros = validarLivro({ ...livroValido, quantidade: 0 });
    expect(erros).toHaveLength(0);
  });
});
