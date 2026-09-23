import express from "express";
import cors from "cors";

// Import das rotas conforme os ficheiros na pasta routes/
import { clientesRouter } from "./routes/clientes.js";
import { osRouter } from "./routes/os.js";             // <-- Ficheiro os.ts
import { osItensRouter } from "./routes/osItens.js";       // <-- Ficheiro osItens.ts
import { estoqueRouter } from "./routes/estoque.js";
import { financeiroRouter } from "./routes/financeiro.js";
import { pdvRouter } from "./routes/pdv.js";
import { dashboardRouter } from "./routes/dashboard.js";

const app = express();

app.use(cors());
app.use(express.json());

// Registar os Middlewares/Rotas
app.use("/clientes", clientesRouter);
app.use("/ordens-servico", osRouter);    // Mapeia o os.ts para a rota /ordens-servico
app.use("/os-itens", osItensRouter);     // Mapeia o osItens.ts para /os-itens
app.use("/produtos", estoqueRouter);     // Mapeia estoque.ts para /produtos
app.use("/financeiro", financeiroRouter);
app.use("/vendas-balcao", pdvRouter);     // Mapeia pdv.ts para /vendas-balcao
app.use("/dashboard", dashboardRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
