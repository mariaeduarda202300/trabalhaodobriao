-- Remove a coluna de texto livre "autor" (substituída pela relação N:N com "authors")
ALTER TABLE "products" DROP COLUMN "autor";

-- CreateTable: perfis (1:1 com users)
CREATE TABLE "perfis" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "perfis_userId_key" ON "perfis"("userId");

ALTER TABLE "perfis" ADD CONSTRAINT "perfis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: authors
CREATE TABLE "authors" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nacionalidade" TEXT,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable: book_authors (N:N entre products e authors)
CREATE TABLE "book_authors" (
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "book_authors_pkey" PRIMARY KEY ("bookId","authorId")
);

ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: emprestimos (1:N a partir de users e de products)
CREATE TABLE "emprestimos" (
    "id" TEXT NOT NULL,
    "dataEmprestimo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucaoPrevista" TIMESTAMP(3) NOT NULL,
    "dataDevolucaoReal" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: reservas (1:N a partir de users e de products)
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "dataReserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "reservas" ADD CONSTRAINT "reservas_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
