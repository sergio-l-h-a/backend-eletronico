import { Router } from "express";
import { db } from "../db/index.js";
import { osItens, produtos } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const osItensRouter = Router();

// Obter a referência correta da coluna de FK (osId ou os_id)
const osIdColumn = (osItens as any).osId ?? (osItens as any).os_id;

// Listar itens de uma OS
osItensRouter.get("/:osId", async (req, res) => {
  try {
    const osId = Number(req.params.osId);

    if (isNaN(osId)) {
      return res.status(400).json({ error: "ID da OS inválido" });
    }

    const itens = await db
      .select()
      .from(osItens)
      .where(eq(osIdColumn, osId));

    res.json(itens);
  } catch (error: any) {
    console.error("Erro ao listar itens da OS:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Adicionar item à OS
osItensRouter.post("/:osId", async (req, res) => {
  try {
    const osId = Number(req.params.osId);
    const { tipo, descricao, quantidade, valorUnitario, produtoId } = req.body;

    if (isNaN(osId)) {
      return res.status(400).json({ error: "ID da OS inválido" });
    }

    const qtdNum = Number(quantidade) || 1;
    const valorNum = Number(valorUnitario) || 0;
    const prodIdNum = produtoId ? Number(produtoId) : null;

    // Montagem dinâmica e segura dos dados
    const itemData: Record<string, any> = {
      tipo,
      descricao,
      quantidade: qtdNum,
      valorUnitario: valorNum,
      produtoId: prodIdNum,
      osId: osId,
      os_id: osId,
    };

    const novoItem = await db
      .insert(osItens)
      .values(itemData as any)
      .returning();

    // Se for peça -> reduz estoque do produto
    if (tipo === "peca" && prodIdNum) {
      await db
        .update(produtos)
        .set({
          estoqueAtual: sql`${produtos.estoqueAtual} - ${qtdNum}`,
        })
        .where(eq(produtos.id, prodIdNum));
    }

    // Recalcular total da OS no PostgreSQL
    await db.execute(sql`
      UPDATE ordens_servico
      SET valor_total = (
        SELECT COALESCE(SUM(quantidade * valor_unitario), 0)
        FROM os_itens
        WHERE os_id = ${osId}
      )
      WHERE id = ${osId}
    `);

    res.status(201).json(novoItem[0]);
  } catch (error: any) {
    console.error("Erro ao adicionar item na OS:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Excluir item da OS
osItensRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID do item inválido" });
    }

    const itemEncontrado = await db
      .select()
      .from(osItens)
      .where(eq(osItens.id, id));

    if (!itemEncontrado[0]) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    const item: any = itemEncontrado[0];
    const osId = item.osId ?? item.os_id;
    const { tipo, produtoId, quantidade } = item;

    // Apaga o item
    await db.delete(osItens).where(eq(osItens.id, id));

    // Se era uma peça -> devolve ao estoque
    if (tipo === "peca" && produtoId) {
      await db
        .update(produtos)
        .set({
          estoqueAtual: sql`${produtos.estoqueAtual} + ${Number(quantidade) || 1}`,
        })
        .where(eq(produtos.id, produtoId));
    }

    // Recalcular total da OS
    await db.execute(sql`
      UPDATE ordens_servico
      SET valor_total = (
        SELECT COALESCE(SUM(quantidade * valor_unitario), 0)
        FROM os_itens
        WHERE os_id = ${osId}
      )
      WHERE id = ${osId}
    `);

    res.json({ ok: true, id, osId });
  } catch (error: any) {
    console.error("Erro ao excluir item da OS:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});