# CARS NEON — Frontend (React + Vite)

Frontend didático em **React (JavaScript puro) + Vite** para consumir o backend
Express/Prisma (`CARS_NEON_backend`). Feito para uso em sala de aula, com
comentários em português explicando cada conceito de React usado.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:5173` no navegador.

> **Importante:** o backend precisa estar rodando em `http://localhost:3000`
> (é o valor configurado em `src/services/api.js`, na constante `BASE_URL`).
> Se o backend rodar em outra porta, ajuste essa constante.

## Estrutura do projeto

```
src/
  context/
    AuthContext.jsx     -> Context API: guarda token JWT e usuário logado
  services/
    api.js               -> Todas as chamadas fetch() para o backend
  components/
    RotaProtegida.jsx    -> "Porteiro" que bloqueia telas para quem não logou
    ProductForm.jsx       -> Formulário reaproveitado para criar/editar produto
  pages/
    Login.jsx
    Register.jsx
    Products.jsx          -> Listagem + CRUD completo de produtos
  App.jsx                 -> Rotas da aplicação (react-router-dom)
  main.jsx                -> Ponto de entrada
  index.css                -> Estilos globais (variáveis de cor, botões, tabela)
```

## Conceitos de React usados (para revisar com os alunos)

- **useState** — guardar valores que mudam com o tempo (campos de formulário,
  listas, mensagens de erro).
- **useEffect** — rodar código em momentos específicos (buscar produtos quando
  a tela abre, preencher o formulário quando um produto é selecionado para edição).
- **Context API (createContext / useContext)** — compartilhar o token JWT e os
  dados do usuário logado entre várias telas, sem precisar passar por props em
  cada componente intermediário.
- **react-router-dom** — múltiplas "páginas" dentro de uma única aplicação
  (SPA), incluindo uma rota protegida que verifica login.
- **Componentes reutilizáveis** — `ProductForm.jsx` serve tanto para criar
  quanto para editar produtos, usando uma prop (`produtoEmEdicao`) para saber
  em qual modo está.
- **Comunicação com API (fetch)** — camada única (`api.js`) que sempre envia o
  token JWT no cabeçalho `Authorization: Bearer <token>`.

## ⚠️ Um bug encontrado no backend (ProductController.js)

Na função `updateProduct`, o campo de preço está sendo enviado com o nome
errado:

```js
data: {
  descricao: req.body.descricao,
  reco: req.body.preco,     // <-- deveria ser "preco", não "reco"
  quantidade: req.body.quantidade,
  userId: req.user.id
}
```

Isso provavelmente fará o Prisma rejeitar a atualização (campo `reco` não
existe no schema) ou simplesmente ignorar o preço na atualização, dependendo
da versão do Prisma. Vale corrigir para `preco: req.body.preco` antes de usar
a função de "editar produto" em sala.

## Rotas do backend usadas por este frontend

| Ação                     | Método | Rota                | Protegida? |
|--------------------------|--------|----------------------|------------|
| Cadastrar usuário        | POST   | `/register`          | Não        |
| Login                    | POST   | `/login`             | Não        |
| Listar produtos          | GET    | `/api/products`      | Sim (JWT)  |
| Criar produto            | POST   | `/api/products`      | Sim (JWT)  |
| Atualizar produto        | PUT    | `/api/products/:id`  | Sim (JWT)  |
| Excluir produto          | DELETE | `/api/products/:id`  | Sim (JWT)  |
