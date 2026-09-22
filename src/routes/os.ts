import { Router } from "express";
import { db } from "../db/index.js";
import { ordensServico } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const osRouter = Router();

// Listar OS
osRouter.get("/", async (req, res) => {
  const lista = await db
    .select()
    .from(ordensServico)
    .orderBy(sql`criado_em DESC`);
  res.json(lista);
});

// Buscar OS específica
osRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const os = await db
    .select()
    .from(ordensServico)
    .where(eq(ordensServico.id, id));
  res.json(os[0] || null);
});

// Criar OS
osRouter.post("/", async (req, res) => {
  const novaOS = await db.insert(ordensServico).values(req.body).returning();
  res.json(novaOS[0]);
});

// Editar OS
osRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const atualizada = await db
    .update(ordensServico)
    .set(req.body)
    .where(eq(ordensServico.id, id))
    .returning();
  res.json(atualizada[0]);
});

// Atualizar status
osRouter.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const atualizada = await db
    .update(ordensServico)
    .set({ status })
    .where(eq(ordensServico.id, id))
    .returning();
  res.json(atualizada[0]);
});

// Excluir OS
osRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(ordensServico).where(eq(ordensServico.id, id));
  res.json({ ok: true });
});
