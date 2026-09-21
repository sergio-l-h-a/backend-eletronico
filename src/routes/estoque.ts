import { Router } from "express";
import { db } from "../db/index.js";
import { produtos } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const estoqueRouter = Router();

// Listar produtos
estoqueRouter.get("/", async (req, res) => {
  const lista = await db
    .select()
    .from(produtos)
    .orderBy(sql`criado_em DESC`);
  res.json(lista);
});

// Buscar produto
estoqueRouter.get("/buscar", async (req, res) => {
  const q = req.query.q?.toString() || "";
  const lista = await db
    .select()
    .from(produtos)
    .where(sql`LOWER(nome) LIKE LOWER('%${q}%')`);
  res.json(lista);
});

// Criar produto
estoqueRouter.post("/", async (req, res) => {
  const novo = await db.insert(produtos).values(req.body).returning();
  res.json(novo[0]);
});

// Atualizar produto
estoqueRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const atualizado = await db
    .update(produtos)
    .set(req.body)
    .where(eq(produtos.id, id))
    .returning();
  res.json(atualizado[0]);
});

// Entrada de estoque
estoqueRouter.patch("/:id/entrada", async (req, res) => {
  const id = Number(req.params.id);
  const { quantidade } = req.body;

  const atualizado = await db
    .update(produtos)
    .set({
      estoqueAtual: sql`${produtos.estoqueAtual} + ${quantidade}`,
    })
    .where(eq(produtos.id, id))
    .returning();

  res.json(atualizado[0]);
});

// Saída de estoque
estoqueRouter.patch("/:id/saida", async (req, res) => {
  const id = Number(req.params.id);
  const { quantidade } = req.body;

  const atualizado = await db
    .update(produtos)
    .set({
      estoqueAtual: sql`${produtos.estoqueAtual} - ${quantidade}`,
    })
    .where(eq(produtos.id, id))
    .returning();

  res.json(atualizado[0]);
});

// Excluir produto
estoqueRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(produtos).where(eq(produtos.id, id));
  res.json({ ok: true });
});
