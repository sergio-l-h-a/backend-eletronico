import { Router } from "express";
import { db } from "../db/index.js";
import { vendasBalcao, ordensServico, despesas } from "../db/schema.js";
import { sql } from "drizzle-orm";

export const financeiroRouter = Router();

// Resumo geral
financeiroRouter.get("/resumo", async (req, res) => {
  const [{ totalVendas }] = await db
    .select({ totalVendas: sql<number>`sum(CAST(total AS numeric))` })
    .from(vendasBalcao);

  const [{ totalOS }] = await db
    .select({ totalOS: sql<number>`sum(CAST(valor_total AS numeric))` })
    .from(ordensServico)
    .where(sql`status = 'Entregue'`);

  const [{ totalDespesas }] = await db
    .select({ totalDespesas: sql<number>`sum(CAST(valor AS numeric))` })
    .from(despesas);

  const lucro = (Number(totalVendas) || 0) + (Number(totalOS) || 0) - (Number(totalDespesas) || 0);

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
