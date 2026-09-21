import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { osRouter } from "./routes/os.js";
// importe outras rotas...

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/os", osRouter);
// app.use("/api/produtos", produtosRouter);
// app.use("/api/clientes", clientesRouter);
// app.use("/api/financeiro", financeiroRouter);
// app.use("/api/pdv", pdvRouter);
//app.use("/api/estoque", estoqueRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
