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
import { ilike, or } from "drizzle-orm";

clientesRouter.get("/:id/buscar", async (req, res) => {
  try {
    const q = req.query.q?.toString() || "";

    if (!q.trim()) {
      const todos = await db.select().from(clientes);
      return res.json(todos);
    }

    const termo = `%${q}%`;

    const lista = await db
      .select()
      .from(clientes)
      .where(
        or(
          ilike(clientes.nome, termo),
          ilike(clientes.telefone, termo),
          ilike(clientes.cpf, termo)
        )
      );

    return res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ error: "Erro interno ao buscar clientes" });
  }
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
