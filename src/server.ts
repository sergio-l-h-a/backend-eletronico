import express from "express";
import cors from "cors";

import { clientesRouter } from "./routes/clientes.js";
import { osRouter } from "./routes/os.js";
import { osItensRouter } from "./routes/osItens.js";
import { estoqueRouter } from "./routes/estoque.js";
import { financeiroRouter } from "./routes/financeiro.js";
import { pdvRouter } from "./routes/pdv.js";
import { vendaItensRouter } from "./routes/vendasItens.js"; // <-- Importar o novo router
import { dashboardRouter } from "./routes/dashboard.js";

const app = express();

app.use(cors());
app.use(express.json());

// Registar os Middlewares/Rotas
app.use("/clientes", clientesRouter);
app.use("/ordens-servico", osRouter);
app.use("/os-itens", osItensRouter);
app.use("/produtos", estoqueRouter);
app.use("/financeiro", financeiroRouter);
app.use("/vendas-balcao", pdvRouter);
app.use("/vendas-itens", vendaItensRouter); // <-- REGISTAR AQUI
app.use("/dashboard", dashboardRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
