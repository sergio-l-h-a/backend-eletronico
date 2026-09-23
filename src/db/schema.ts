import { pgTable, serial, varchar, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";

export const ordensServico = pgTable("ordens_servico", {
  id: serial("id").primaryKey(),
  cliente: varchar("cliente", { length: 120 }),
  telefone: varchar("telefone", { length: 20 }),
  aparelho: varchar("aparelho", { length: 120 }).notNull(),
  marca: varchar("marca", { length: 120 }).notNull(),
  defeito: text("defeito").notNull(),
  servico: text("servico"),
  pecas: text("pecas"),
  valorTotal: numeric("valor_total").notNull(),
  status: varchar("status", { length: 50 }).default("Aguardando Avaliação"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const vendasBalcao = pgTable("vendas_balcao", {
  id: serial("id").primaryKey(),
  cliente: varchar("cliente", { length: 120 }),
  vendaId: integer("venda_id"),
  clienteId: integer("cliente_id"),
  formaPagamento: varchar("forma_pagamento", { length: 50 }).notNull(),
  valorTotal: numeric("total").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const vendasItens = pgTable("vendas_itens", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").notNull(),
  produtoId: integer("produto_id").notNull(),
  quantidade: integer("quantidade").notNull(),
  precoUnitario: numeric("preco_unitario").notNull(),
});

export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  categoriaId: integer("categoria_id").notNull(),
  precoCusto: numeric("preco").notNull(),
  precoVenda: numeric("preco_venda").notNull(),
  estoqueAtual: integer("estoque_atual").notNull().default(0),
  estoqueMinimo: integer("estoque_minimo").notNull().default(1),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// src/db/schema.ts
export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  telefone: text('telefone').notNull(),
  // cpf: text('cpf'), <-- Remova ou comente esta linha
  email: text('email'),
  criadoEm: timestamp('criado_em').defaultNow(),
});

export const despesas = pgTable("despesas", {
  id: serial("id").primaryKey(),
  descricao: varchar("descricao", { length: 200 }).notNull(),
  valor: numeric("valor").notNull(),
  categoria: varchar("categoria", { length: 100 }),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const tecnicos = pgTable("tecnicos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  especialidade: varchar("especialidade", { length: 120 }),
  comissaoPercentual: numeric("comissao_percentual").notNull().default('0.00'),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  categoriaId: integer("categoria_id"), // para subcategorias
  criadoEm: timestamp("criado_em").defaultNow(),
});


export const osItens = pgTable("os_itens", {
  id: serial("id").primaryKey(),
  ordensServicoId: integer("ordens_servico_id")
    .references(() => ordensServico.id)
    .notNull(),
  produtoId: integer("produto_id")
    .references(() => produtos.id)
    .notNull(),
  quantidade: integer("quantidade").notNull(),
  precoUnitario: numeric("preco_unitario").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// ... (tecnicos, categorias, produtos, ordensServico, osItens, vendasBalcao, vendaItens, relations)
// copie exatamente do seu arquivo atual
