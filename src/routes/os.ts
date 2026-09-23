import { Router } from "express";
import { db } from "../db/index.js";
import { ordensServico } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

export const osRouter = Router();

// 1. Listar todas as OS
osRouter.get("/", async (req, res) => {
  try {
    const lista = await db
      .select()
      .from(ordensServico)
      .orderBy(desc(ordensServico.id));

    res.json(lista);
  } catch (error) {
    console.error("Erro ao listar Ordens de Serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// 2. Buscar OS específica por ID
osRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const os = await db
      .select()
      .from(ordensServico)
      .where(eq(ordensServico.id, id));

    if (!os[0]) {
      return res.status(404).json({ error: "Ordem de Serviço não encontrada." });
    }

    res.json(os[0]);
  } catch (error) {
    console.error("Erro ao buscar Ordem de Serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// 3. Criar nova OS
osRouter.post("/", async (req, res) => {
  try {
    const { cliente, telefone, aparelho, marca, defeito, status, valorTotal } = req.body;

    if (!cliente || !aparelho) {
      return res.status(400).json({ error: "Cliente e aparelho são obrigatórios." });
    }

    const novaOS = await db
      .insert(ordensServico)
      .values({
        cliente,
        telefone: telefone || "",
        aparelho,
        marca: marca || "",
        defeito: defeito || "",
        status: status || "Aguardando Avaliação",
        valorTotal: valorTotal || "0.00",
      } as any)
      .returning();

    res.status(201).json(novaOS[0]);
  } catch (error) {
    console.error("Erro ao criar Ordem de Serviço:", error);
    res.status(500).json({ error: "Erro interno ao salvar Ordem de Serviço." });
  }
});

// 4. Editar OS inteira
osRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { cliente, telefone, aparelho, marca, defeito, status, valorTotal } = req.body;

    const atualizada = await db
      .update(ordensServico)
      .set({
        cliente,
        telefone,
        aparelho,
        marca,
        defeito,
        status,
        valorTotal,
      } as any)
      .where(eq(ordensServico.id, id))
      .returning();

    if (!atualizada[0]) {
      return res.status(404).json({ error: "Ordem de Serviço não encontrada." });
    }

    res.json(atualizada[0]);
  } catch (error) {
    console.error("Erro ao atualizar Ordem de Serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// 5. Atualizar apenas o status da OS
osRouter.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status é obrigatório." });
    }

    const atualizada = await db
      .update(ordensServico)
      .set({ status } as any)
      .where(eq(ordensServico.id, id))
      .returning();

    if (!atualizada[0]) {
      return res.status(404).json({ error: "Ordem de Serviço não encontrada." });
    }

    res.json(atualizada[0]);
  } catch (error) {
    console.error("Erro ao atualizar status da OS:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// 6. Excluir OS
osRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const deletada = await db
      .delete(ordensServico)
      .where(eq(ordensServico.id, id))
      .returning();

    if (!deletada[0]) {
      return res.status(404).json({ error: "Ordem de Serviço não encontrada." });
    }

    res.json({ ok: true, id });
  } catch (error) {
    console.error("Erro ao excluir Ordem de Serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});