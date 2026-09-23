import { Router } from "express";
import { db } from "../db/index.js";
import { vendasItens, produtos } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const vendaItensRouter = Router();

// Listar itens da venda
vendaItensRouter.get("/:vendaId", async (req, res) => {
  try {
    const vendaId = Number(req.params.vendaId);

    if (isNaN(vendaId)) {
      return res.status(400).json({ error: "ID da venda inválido." });
    }

    const itens = await db
      .select()
      .from(vendasItens)
      .where(eq((vendasItens as any).vendaId || (vendasItens as any).venda_id, vendaId));

    res.json(itens);
  } catch (error) {
    console.error("Erro ao procurar itens da venda:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Adicionar item
vendaItensRouter.post("/:vendaId", async (req, res) => {
  try {
    const vendaId = Number(req.params.vendaId);
    const { produtoId, descricao, quantidade, precoUnitario } = req.body;

    if (isNaN(vendaId)) {
      return res.status(400).json({ error: "ID da venda inválido." });
    }

    const qtdNum = Number(quantidade) || 1;
    const precoNum = Number(precoUnitario) || 0;
    const prodIdNum = produtoId ? Number(produtoId) : null;

    // Inserção do item na venda
    const novoItem = await db
      .insert(vendasItens)
      .values({
        vendaId,
        produtoId: prodIdNum,
        descricao,
        quantidade: qtdNum,
        precoUnitario: precoNum,
      } as any)
      .returning();

    // Dar baixa no stock do produto
    if (prodIdNum) {
      await db
        .update(produtos)
        .set({
          estoqueAtual: sql`${produtos.estoqueAtual} - ${qtdNum}`,
        })
        .where(eq(produtos.id, prodIdNum));
    }

    // Recalcular total da venda (com COALESCE e nome correto preco_unitario)
    await db.execute(sql`
      UPDATE vendas_balcao
      SET total = (
        SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
        FROM vendas_itens
        WHERE venda_id = ${vendaId}
      )
      WHERE id = ${vendaId}
    `);

    res.status(201).json(novoItem[0]);
  } catch (error) {
    console.error("Erro ao adicionar item à venda:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Excluir item
vendaItensRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID do item inválido." });
    }

    const itemEncontrado = await db
      .select()
      .from(vendasItens)
      .where(eq(vendasItens.id, id));

    if (!itemEncontrado[0]) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    const item: any = itemEncontrado[0];
    const vendaId = item.vendaId || item.venda_id;
    const { produtoId, quantidade } = item;

    // Apagar o item
    await db.delete(vendasItens).where(eq(vendasItens.id, id));

    // Repor stock do produto
    if (produtoId) {
      await db
        .update(produtos)
        .set({
          estoqueAtual: sql`${produtos.estoqueAtual} + ${Number(quantidade) || 1}`,
        })
        .where(eq(produtos.id, produtoId));
    }

    // Recalcular total da venda
    await db.execute(sql`
      UPDATE vendas_balcao
      SET total = (
        SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
        FROM vendas_itens
        WHERE venda_id = ${vendaId}
      )
      WHERE id = ${vendaId}
    `);

    res.json({ ok: true, id, vendaId });
  } catch (error) {
    console.error("Erro ao eliminar item da venda:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});