import { Router } from "express";
import { db } from "../db/index.js";
import { clientes } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const clientesRouter = Router();

// Listar clientes
clientesRouter.get("/", async (req, res) => {
  const lista = await db
    .select()
    .from(clientes)
    .orderBy(sql`criado_em DESC`);
  res.json(lista);
});

// Buscar cliente
clientesRouter.get("/buscar", async (req, res) => {
  const q = req.query.q?.toString() || "";

  const lista = await db
    .select()
    .from(clientes)
    .where(
      sql`
        LOWER(nome) LIKE LOWER('%${q}%')
        OR telefone LIKE '%${q}%'
        OR cpf LIKE '%${q}%'
      `
    );

  res.json(lista);
});

// Criar cliente
clientesRouter.post("/", async (req, res) => {
  const novo = await db.insert(clientes).values(req.body).returning();
  res.json(novo[0]);
});

// Editar cliente
clientesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const atualizado = await db
    .update(clientes)
    .set(req.body)
    .where(eq(clientes.id, id))
    .returning();
  res.json(atualizado[0]);
});

// Excluir cliente
clientesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(clientes).where(eq(clientes.id, id));
  res.json({ ok: true });
});
