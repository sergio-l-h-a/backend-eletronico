import { Router } from "express";
import { db } from "../db/index.js";
import { ordensServico, vendasBalcao, produtos } from "../db/schema.js";
import { sql, eq } from "drizzle-orm";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res) => {
  try {
    // Query Receita OS (adicionado ::float para conversão nativa do pg)
    const [osRes] = await db
      .select({
        receitaOs: sql<number>`COALESCE(sum(CAST(${ordensServico.valorTotal} AS numeric)), 0)::float`,
      })
      .from(ordensServico)
      .where(eq(ordensServico.status, "Pronto para Retirada"));

    // Query Receita Balcão (adicionado ::float)
    const [balcaoRes] = await db
      .select({
        receitaBalcao: sql<number>`COALESCE(sum(CAST(${vendasBalcao} AS numeric)), 0)::float`,
      })
      .from(vendasBalcao);

    // Query Quantidade de OS Abertas (adicionado ::integer)
    const [abertasRes] = await db
      .select({
        osAbertas: sql<number>`count(*)::integer`,
      })
      .from(ordensServico)
      .where(sql`${ordensServico.status} != 'Entregue'`);

    // Query Produtos com Estoque Baixo (adicionado ::integer)
    const [estoqueRes] = await db
      .select({
        estoqueBaixo: sql<number>`count(*)::integer`,
      })
      .from(produtos)
      .where(sql`${produtos.estoqueAtual} <= ${produtos.estoqueMinimo}`);

    // Últimas 5 Ordens de Serviço
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
      .orderBy(sql`${ordensServico.criadoEm} DESC`)
      .limit(5);

    // Extração com fallback
    const receitaOs = Number(osRes?.receitaOs ?? 0);
    const receitaBalcao = Number(balcaoRes?.receitaBalcao ?? 0);
    const osAbertas = Number(abertasRes?.osAbertas ?? 0);
    const estoqueBaixo = Number(estoqueRes?.estoqueBaixo ?? 0);

    const totalReceita = receitaOs + receitaBalcao;

    return res.json({
      receitaOs,
      receitaBalcao,
      osAbertas,
      estoqueBaixo,
      recentOs,
      totalReceita,
    });
  } catch (error) {
    console.error("Erro ao carregar Dashboard:", error);
    return res.status(500).json({ error: "Erro interno ao buscar dados do dashboard" });
  }
});