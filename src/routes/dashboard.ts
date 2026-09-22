import { Router } from "express";
import { db } from "../db/index.js";
import { ordensServico, vendasBalcao, produtos } from "../db/schema.js";
import { sql, eq } from "drizzle-orm";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res) => {
  // Query Receita OS (status 'Pronto para Retirada')
  const [osRes] = await db
    .select({ receitaOs: sql<number>`COALESCE(sum(CAST(valor_total AS numeric)), 0)` })
    .from(ordensServico)
    .where(eq(ordensServico.status, "Pronto para Retirada"));

  // Query Receita Balcão
  const [balcaoRes] = await db
    .select({ receitaBalcao: sql<number>`COALESCE(sum(CAST(total AS numeric)), 0)` })
    .from(vendasBalcao);

  // Query Quantidade de OS Abertas
  const [abertasRes] = await db
    .select({ osAbertas: sql<number>`count(*)` })
    .from(ordensServico)
    .where(sql`status != 'Entregue'`);

  // Query Produtos com Estoque Baixo
  const [estoqueRes] = await db
    .select({ estoqueBaixo: sql<number>`count(*)` })
    .from(produtos)
    .where(sql`estoque_atual <= estoque_minimo`);

  // Ultimas 5 Ordens de Serviço
  const recentOs = await db
    .select({
      id: ordensServico.id,
      aparelho: ordensServico.aparelho,
      marca: ordensServico.marca,
      status: ordensServico.status,
      valorTotal: ordensServico.valorTotal,
      criadoEm: ordensServico.criadoEm,
    })
    .from(ordensServico)
    .orderBy(sql`criado_em DESC`)
    .limit(5);

  // Extração segura de valores com fallback
  const receitaOs = Number(osRes?.receitaOs ?? 0);
  const receitaBalcao = Number(balcaoRes?.receitaBalcao ?? 0);
  const osAbertas = Number(abertasRes?.osAbertas ?? 0);
  const estoqueBaixo = Number(estoqueRes?.estoqueBaixo ?? 0);

  // Cálculo da Receita Total
  const totalReceita = receitaOs + receitaBalcao;

  res.json({
    receitaOs,
    receitaBalcao,
    osAbertas,
    estoqueBaixo,
    recentOs,
    totalReceita,
  });
});