import { Router } from "express";
import { db } from "../db/index.js";
import { produtos, vendasBalcao, vendasItens } from "../db/schema.js";
import { eq, sql, ilike, or } from "drizzle-orm";

export const pdvRouter = Router();

// Buscar produto por nome ou código (Seguro contra SQL Injection)
pdvRouter.get("/buscar", async (req, res) => {
  const q = req.query.q?.toString().trim() || "";

  if (!q) {
    return res.json([]);
  }

  const termoBusca = `%${q}%`;

  const lista = await db
    .select()
    .from(produtos)
    .where(
      or(
        ilike(produtos.nome, termoBusca),
        sql`CAST(${produtos.id} AS TEXT) LIKE ${termoBusca}`
      )
    )
    .limit(20);

  res.json(lista);
});

// Finalizar venda
pdvRouter.post("/finalizar", async (req, res) => {
  const { cliente, formaPagamento, itens } = req.body;

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: "A venda deve conter ao menos um item." });
  }

  // Cálculo do total da venda
  const totalCalculado = itens.reduce(
    (acc: number, item: any) => acc + (Number(item.precoUnitario) * Number(item.quantidade)),
    0
  );

  // Inserção na tabela vendasBalcao (usando a propriedade valorTotal definida no schema)
  const [venda] = await db
    .insert(vendasBalcao)
    .values({
      cliente: cliente || "Cliente Avulso",
      formaPagamento: formaPagamento || "Dinheiro",
      valorTotal: totalCalculado.toFixed(2), // Mapeado para a coluna 'total' do banco
    })
    .returning();

  if (!venda) {
    return res.status(500).json({ error: "Erro ao registrar a venda." });
  }

  const vendaId = venda.id;

  // Inserção dos itens e atualização de estoque
  for (const item of itens) {
    await db.insert(vendasItens).values({
      vendaId,
      produtoId: item.id,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario.toString(),
    });

    await db
      .update(produtos)
      .set({
        estoqueAtual: sql`${produtos.estoqueAtual} - ${Number(item.quantidade)}`,
      })
      .where(eq(produtos.id, item.id));
  }

  res.json({ ok: true, vendaId });
});