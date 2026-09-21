import { pool, db } from "./db/index.js"; // Ajuste o caminho se seu arquivo de conexão estiver em outro local

async function testConnection() {
  try {
    console.log("🔄 Tentando conectar ao banco de dados...");
    
    // Executa uma query simples de teste diretamente na pool
    const result = await pool.query("SELECT NOW()");
    
    console.log("✅ Conexão estabelecida com sucesso!");
    console.log("🕒 Horário do servidor PostgreSQL:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Erro ao conectar no banco de dados:", error);
  } finally {
    // Encerra a pool para liberar o terminal
    await pool.end();
  }
}

testConnection();