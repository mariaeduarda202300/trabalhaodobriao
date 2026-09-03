const {
  validarRegistroUsuario,
  validarLogin,
  validarLivro,
  validarAutor,
  validarPerfil,
  validarEmprestimo,
  validarReserva,
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
    isbn: '9780261103573',
    descricao: 'Fantasia épica',
    quantidade: 3,
    authorIds: ['author_1'],
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

  it('rejeita authorIds que não seja uma lista de strings', () => {
    const erros = validarLivro({ ...livroValido, authorIds: 'nao-e-array' });
    expect(erros).toContain('authorIds deve ser uma lista de ids de autores.');
  });

  it('aceita authorIds como lista de ids válida', () => {
    const erros = validarLivro({ ...livroValido, authorIds: ['author_1', 'author_2'] });
    expect(erros).toHaveLength(0);
  });

  it('rejeita livro sem nenhum autor selecionado', () => {
    const erros = validarLivro({ ...livroValido, authorIds: [] });
    expect(erros).toContain('Selecione pelo menos um autor.');
  });

  it('rejeita livro quando authorIds nem foi enviado', () => {
    const { authorIds, ...semAutor } = livroValido;
    const erros = validarLivro(semAutor);
    expect(erros).toContain('Selecione pelo menos um autor.');
  });
});

describe('validarAutor', () => {
  it('aceita nome válido', () => {
    expect(validarAutor({ nome: 'J.R.R. Tolkien' })).toHaveLength(0);
  });

  it('rejeita nome ausente', () => {
    expect(validarAutor({ nome: '' })).toContain('Nome do autor é obrigatório.');
  });
});

describe('validarPerfil', () => {
  it('aceita nomeCompleto válido', () => {
    expect(validarPerfil({ nomeCompleto: 'Maria Silva' })).toHaveLength(0);
  });

  it('rejeita nomeCompleto ausente', () => {
    expect(validarPerfil({ nomeCompleto: '' })).toContain('Nome completo é obrigatório.');
  });
});

describe('validarEmprestimo', () => {
  it('aceita dados válidos', () => {
    const erros = validarEmprestimo({ bookId: 'book_1', dataDevolucaoPrevista: '2026-09-20' });
    expect(erros).toHaveLength(0);
  });

  it('rejeita bookId ausente', () => {
    const erros = validarEmprestimo({ bookId: '', dataDevolucaoPrevista: '2026-09-20' });
    expect(erros).toContain('bookId é obrigatório.');
  });

  it('rejeita data de devolução inválida', () => {
    const erros = validarEmprestimo({ bookId: 'book_1', dataDevolucaoPrevista: 'data-invalida' });
    expect(erros).toContain('dataDevolucaoPrevista é obrigatória e deve ser uma data válida.');
  });
});

describe('validarReserva', () => {
  it('aceita bookId válido', () => {
    expect(validarReserva({ bookId: 'book_1' })).toHaveLength(0);
  });

  it('rejeita bookId ausente', () => {
    expect(validarReserva({ bookId: '' })).toContain('bookId é obrigatório.');
  });
});
