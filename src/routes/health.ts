import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});
