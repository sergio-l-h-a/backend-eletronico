import { Router } from "express";
import { db } from "../db/index.js";
import { ordensServico, vendasBalcao, produtos } from "../db/schema.js";
import { sql, eq } from "drizzle-orm";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res) => {
  const [{ receitaOs }] = await db
    .select({ receitaOs: sql<number>`sum(CAST(valor_total AS numeric))` })
    .from(ordensServico)
    .where(eq(ordensServico.status, "Pronto para Retirada"));

  const [{ receitaBalcao }] = await db
    .select({ receitaBalcao: sql<number>`sum(CAST(valor_total AS numeric))` })
    .from(vendasBalcao);

  const [{ osAbertas }] = await db
    .select({ osAbertas: sql<number>`count(*)` })
    .from(ordensServico)
    .where(sql`status != 'Entregue'`);

  const [{ estoqueBaixo }] = await db
    .select({ estoqueBaixo: sql<number>`count(*)` })
    .from(produtos)
    .where(sql`estoque_atual <= estoque_minimo`);

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

  const totalReceita =
    (Number(receitaOs) || 0) + (Number(receitaBalcao) || 0);

  res.json({
    receitaOs,
    receitaBalcao,
    osAbertas,
    estoqueBaixo,
    recentOs,
    totalReceita,
  });
});
