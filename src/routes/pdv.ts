import { Router } from "express";
import { db } from "../db/index.js";
import { produtos, vendasBalcao, vendasItens } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const pdvRouter = Router();

// Buscar produto por nome ou código
pdvRouter.get("/buscar", async (req, res) => {
  const q = req.query.q?.toString() || "";

  const lista = await db
    .select()
    .from(produtos)
    .where(sql`LOWER(nome) LIKE LOWER('%${q}%') OR CAST(id AS TEXT) LIKE '%${q}%'`)
    .limit(20);

  res.json(lista);
});

// Finalizar venda
pdvRouter.post("/finalizar", async (req, res) => {
  const { cliente, itens } = req.body;

  const total = itens.reduce(
    (acc: number, item: any) => acc + item.precoUnitario * item.quantidade,
    0
  );

  const venda = await db
    .insert(vendasBalcao)
    .values({ cliente, total })
    .returning();

  const vendaId = venda[0].id;

  for (const item of itens) {
    await db.insert(vendasItens).values({
      vendaId,
      produtoId: item.id,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    });

    await db
      .update(produtos)
      .set({
        estoqueAtual: sql`${produtos.estoqueAtual} - ${item.quantidade}`,
      })
      .where(eq(produtos.id, item.id));
  }

  res.json({ ok: true, vendaId });
});
