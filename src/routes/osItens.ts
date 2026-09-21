import { Router } from "express";
import { db } from "../db/index.js";
import { osItens, ordensServico, produtos } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const osItensRouter = Router();

// Listar itens da OS
osItensRouter.get("/:osId", async (req, res) => {
  const osId = Number(req.params.osId);

  const itens = await db
    .select()
    .from(osItens)
    .where(eq(osItens.osId, osId));

  res.json(itens);
});

// Adicionar item
osItensRouter.post("/:osId", async (req, res) => {
  const osId = Number(req.params.osId);
  const { tipo, descricao, quantidade, valorUnitario, produtoId } = req.body;

  const novoItem = await db
    .insert(osItens)
    .values({
      osId,
      tipo,
      descricao,
      quantidade,
      valorUnitario,
    })
    .returning();

  // Se for peça → baixa estoque
  if (tipo === "peca" && produtoId) {
    await db
      .update(produtos)
      .set({
        estoqueAtual: sql`${produtos.estoqueAtual} - ${quantidade}`,
      })
      .where(eq(produtos.id, produtoId));
  }

  // Recalcular total da OS
  await db.execute(sql`
    UPDATE ordens_servico
    SET valor_total = (
      SELECT SUM(quantidade * valor_unitario)
      FROM os_itens
      WHERE os_id = ${osId}
    )
    WHERE id = ${osId}
  `);

  res.json(novoItem[0]);
});

// Excluir item
osItensRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const item = await db
    .select()
    .from(osItens)
    .where(eq(osItens.id, id));

  if (!item[0]) return res.json({ ok: false });

  const osId = item[0].osId;

  await db.delete(osItens).where(eq(osItens.id, id));

  // Recalcular total da OS
  await db.execute(sql`
    UPDATE ordens_servico
    SET valor_total = (
      SELECT SUM(quantidade * valor_unitario)
      FROM os_itens
      WHERE os_id = ${osId}
    )
    WHERE id = ${osId}
  `);

  res.json({ ok: true });
});
