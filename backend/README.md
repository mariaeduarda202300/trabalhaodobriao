# Backend — Biblioteca (Livros)

API REST em Express + Prisma (PostgreSQL via Neon) com autenticação JWT.

## O que foi corrigido/implementado nesta parte

- **Banco de dados**: `schema.prisma` estava configurado como `mysql`, mas a
  conexão (Neon) é PostgreSQL — corrigido. A migration também estava
  desatualizada em relação ao modelo `Book` (faltavam `titulo`, `autor`,
  `isbn`) — corrigida.
- **CRUD de Livros** (`controllers/ProductController.js`): validações de
  campos obrigatórios e checagem de que só o dono do livro pode
  editar/excluir (antes qualquer usuário autenticado podia mexer no livro de
  outro usuário).
- **CRUD de Usuários** (`controllers/UserController.js`): validação de
  e-mail/usuário/senha, tratamento de erros, e a resposta do cadastro não
  devolve mais o hash da senha.
- **Integração com o front-end**: o `frontend/src/services/api.js` chamava
  rotas erradas (`/api/products` em vez de `/api/books`) e tinha um erro de
  digitação no nome de uma função (`listarLivrosporDono` vs
  `listarLivrosPorDono`) que quebrava a tela de listagem. Corrigido, e o
  redirecionamento pós-login também apontava para `/products` em vez de
  `/books`.
- **Testes**: suíte com Jest + Supertest cobrindo validações, autenticação e
  as regras de dono do livro (30 testes, ver `tests/`).
- **Segurança**: o arquivo `backend/.env` com a senha real do banco estava
  versionado no Git (o `.gitignore` só ignorava `.env.local`). Isso foi
  corrigido — mas **é fundamental trocar a senha do banco no painel do Neon**,
  já que ela pode ter sido exposta no repositório remoto.

## Configuração do banco de dados

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` com a string de
   conexão do seu banco Neon (Settings → Connection string) e um `JWT_SECRET`
   forte.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Aplique as migrations no banco:
   ```bash
   npx prisma migrate deploy
   ```
   Se o banco já tiver sido criado com o schema antigo (colunas erradas), use
   em vez disso, em ambiente de desenvolvimento:
   ```bash
   npx prisma migrate reset
   ```
   (isso apaga os dados e recria as tabelas do zero a partir das migrations).
4. Suba o servidor:
   ```bash
   npm start
   ```
5. Verifique a conexão com o banco:
   ```bash
   curl http://localhost:3000/health
   ```
   Deve responder `{"status":"ok","database":"connected"}`.

## Modelo de dados

- `User` **1:1** `Perfil` — dados complementares do usuário.
- `User` **1:N** `Book` — livros cadastrados pelo usuário.
- `Book` **N:N** `Author` (via `BookAuthor`) — um livro pode ter vários
  autores, e um autor pode ter vários livros.
- `User`/`Book` **1:N** `Emprestimo` — regra de negócio: não permite
  empréstimo se não houver exemplares disponíveis
  (`quantidade` do livro menos empréstimos em aberto).
- `User`/`Book` **1:N** `Reserva` — regra de negócio: um mesmo usuário não
  pode ter duas reservas `ATIVA` para o mesmo livro.

## Rotas da API

| Método | Rota                               | Protegida | Descrição                                     |
|--------|-------------------------------------|-----------|-------------------------------------------------|
| POST   | `/register`                        | não       | Cria um usuário                                 |
| POST   | `/login`                           | não       | Retorna um token JWT                            |
| GET    | `/api/books`                       | sim       | Lista todos os livros (com autores e disponibilidade) |
| GET    | `/api/me/books`                    | sim       | Lista os livros do usuário logado               |
| GET    | `/api/books/:id`                   | sim       | Detalhe de um livro                             |
| POST   | `/api/books`                       | sim       | Cria um livro (`authorIds: string[]` opcional)  |
| PUT    | `/api/books/:id`                   | sim       | Atualiza um livro (só o dono)                   |
| DELETE | `/api/books/:id`                   | sim       | Exclui um livro (só o dono, sem empréstimo/reserva ativos) |
| GET    | `/api/authors`                     | sim       | Lista autores                                   |
| GET    | `/api/authors/:id`                 | sim       | Detalhe de um autor (com seus livros)           |
| POST   | `/api/authors`                     | sim       | Cria um autor                                   |
| PUT    | `/api/authors/:id`                 | sim       | Atualiza um autor                               |
| DELETE | `/api/authors/:id`                 | sim       | Exclui um autor                                 |
| GET    | `/me/perfil`                       | sim       | Perfil (1:1) do usuário logado                  |
| POST   | `/me/perfil`                       | sim       | Cria o perfil do usuário logado                 |
| PUT    | `/me/perfil`                       | sim       | Atualiza o perfil do usuário logado             |
| GET    | `/emprestimos`                     | sim       | Lista todos os empréstimos                      |
| GET    | `/me/emprestimos`                  | sim       | Lista os empréstimos do usuário logado          |
| GET    | `/emprestimos/:id`                 | sim       | Detalhe de um empréstimo                        |
| POST   | `/emprestimos`                     | sim       | Cria um empréstimo (`bookId`, `dataDevolucaoPrevista`) |
| PUT    | `/emprestimos/:id/devolver`        | sim       | Marca o empréstimo como devolvido               |
| GET    | `/reservas`                        | sim       | Lista todas as reservas                         |
| GET    | `/me/reservas`                     | sim       | Lista as reservas do usuário logado             |
| GET    | `/reservas/:id`                    | sim       | Detalhe de uma reserva                          |
| POST   | `/reservas`                        | sim       | Cria uma reserva (`bookId`)                     |
| PUT    | `/reservas/:id/cancelar`           | sim       | Cancela uma reserva ativa                       |
| GET    | `/relatorios/livros-com-emprestimos` | sim     | Consulta avançada: livros + autores + empréstimos + reservas ativas |
| GET    | `/health`                          | não       | Verifica se a API e o banco estão OK            |

Rotas protegidas exigem o header `Authorization: Bearer <token>`.

## Depois de puxar essas mudanças

Como o schema mudou (novas tabelas `perfis`, `authors`, `book_authors`,
`emprestimos`, `reservas`, e a coluna `autor` foi removida de `products`),
rode:

```bash
npx prisma generate
npx prisma migrate dev
```

O Prisma vai detectar a migration já escrita em
`prisma/migrations/20260902120000_add_authors_perfil_emprestimos_reservas`
e aplicá-la no seu banco Neon. Se preferir, pode deixar o Prisma gerar a
migration sozinho (`migrate dev --name ...`) a partir do novo
`schema.prisma` — o efeito final é o mesmo.

## Rodando os testes

```bash
npm test
```

Os testes usam um Prisma "mockado" (`jest.mock('../config/db')`), então
**não é preciso banco de dados real para rodá-los** — eles cobrem regras de
negócio e validação isoladamente.
