import { Router } from "express";
import { db } from "../db/index.js";
import { vendasItens, vendasBalcao, produtos } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const vendaItensRouter = Router();

// Listar itens da venda
vendaItensRouter.get("/:vendaId", async (req, res) => {
  const vendaId = Number(req.params.vendaId);

  const itens = await db
    .select()
    .from(vendasItens)
    .where(eq(vendasItens.vendaId, vendaId));

  res.json(itens);
});

// Adicionar item
vendaItensRouter.post("/:vendaId", async (req, res) => {
  const vendaId = Number(req.params.vendaId);
  const { produtoId, descricao, quantidade, valorUnitario } = req.body;

  const novoItem = await db
    .insert(vendasItens)
    .values({
      vendaId,
      produtoId,
      descricao,
      quantidade,
      valorUnitario,
    })
    .returning();

  // Baixar estoque
  await db
    .update(produtos)
    .set({
      estoqueAtual: sql`${produtos.estoqueAtual} - ${quantidade}`,
    })
    .where(eq(produtos.id, produtoId));

  // Recalcular total da venda
  await db.execute(sql`
    UPDATE vendas_balcao
    SET total = (
      SELECT SUM(quantidade * valor_unitario)
      FROM vendas_itens
      WHERE venda_id = ${vendaId}
    )
    WHERE id = ${vendaId}
  `);

  res.json(novoItem[0]);
});

// Excluir item
vendaItensRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const item = await db
    .select()
    .from(vendasItens)
    .where(eq(vendasItens.id, id));

  if (!item[0]) return res.json({ ok: false });

  const vendaId = item[0].vendaId;

  await db.delete(vendasItens).where(eq(vendasItens.id, id));

  // Recalcular total da venda
  await db.execute(sql`
    UPDATE vendas_balcao
    SET total = (
      SELECT SUM(quantidade * valor_unitario)
      FROM vendas_itens
      WHERE venda_id = ${vendaId}
    )
    WHERE id = ${vendaId}
  `);

  res.json({ ok: true });
});
