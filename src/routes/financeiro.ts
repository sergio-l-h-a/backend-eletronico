import { Router } from "express";
import { db } from "../db/index.js";
import { vendasBalcao, ordensServico, despesas } from "../db/schema.js";
import { sql } from "drizzle-orm";

export const financeiroRouter = Router();

// Resumo geral
financeiroRouter.get("/resumo", async (req, res) => {
  // Query Total Vendas
  const [vendasRes] = await db
    .select({ totalVendas: sql<number>`COALESCE(sum(CAST(total AS numeric)), 0)` })
    .from(vendasBalcao);

  // Query Total Ordens de Serviço (status 'Entregue')
  const [osRes] = await db
    .select({ totalOS: sql<number>`COALESCE(sum(CAST(valor_total AS numeric)), 0)` })
    .from(ordensServico)
    .where(sql`status = 'Entregue'`);

  // Query Total Despesas
  const [despesasRes] = await db
    .select({ totalDespesas: sql<number>`COALESCE(sum(CAST(valor AS numeric)), 0)` })
    .from(despesas);

  // Extração segura com fallback para 0
  const totalVendas = Number(vendasRes?.totalVendas ?? 0);
  const totalOS = Number(osRes?.totalOS ?? 0);
  const totalDespesas = Number(despesasRes?.totalDespesas ?? 0);

  // Cálculo de Lucro
  const lucro = totalVendas + totalOS - totalDespesas;

  res.json({
    totalVendas,
    totalOS,
    totalDespesas,
    lucro,
  });
});

// Listar despesas
financeiroRouter.get("/despesas", async (req, res) => {
  const lista = await db
    .select()
    .from(despesas)
    .orderBy(sql`criado_em DESC`);
  res.json(lista);
});

// Criar despesa
financeiroRouter.post("/despesas", async (req, res) => {
  const nova = await db.insert(despesas).values(req.body).returning();
  res.json(nova[0]);
});