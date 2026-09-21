import { db } from './index.js';
import {
  clientes,
  tecnicos,
  categorias,
  produtos,
  ordensServico,
  osItens,
  vendasBalcao,
  vendasItens
} from './schema.js';

async function main() {
  console.log('Seeding data...');

  // 1. Inserir categorias
  const cats = await db.insert(categorias).values([
    { nome: 'HÉLICES', categoriaId: 0 },
    { nome: 'GRADES', categoriaId: 0 },
    { nome: 'COPOS DE LIQUIDIFICADOR', categoriaId: 0 },
    { nome: 'CAPACITORES', categoriaId: 0 },
    { nome: 'MOTORES', categoriaId: 0 },
    { nome: 'BUCHAS', categoriaId: 0 },
    { nome: 'CABOS/PLUGS' },
  ]).returning();

  // 2. Inserir técnicos
  const tecs = await db.insert(tecnicos).values([
    { nome: 'Carlos Silva', especialidade: 'Ventiladores e Liquidificadores', comissaoPercentual: '20.00' },
    { nome: 'Roberto Alves', especialidade: 'Micro-ondas e Air Fryer', comissaoPercentual: '25.00' },
  ]).returning();

  // 3. Inserir clientes
  const clis = await db.insert(clientes).values([
    { nome: 'Ana Rita', telefone: '11999999999' },
    { nome: 'João Pedro', telefone: '11888888888' },
    { nome: 'Maria Aparecida', telefone: '11777777777' },
  ]).returning();

  // 4. Inserir produtos
  const prods = await db.insert(produtos).values([
    { nome: 'Hélice Ventilador Mondial 40cm', categoriaId: cats[0]!.id, precoCusto: '15.00', precoVenda: '35.00', estoqueAtual: 10, estoqueMinimo: 5 },
    { nome: 'Copo Liquidificador Arno Power', categoriaId: cats[2]!.id, precoCusto: '20.00', precoVenda: '45.00', estoqueAtual: 2, estoqueMinimo: 5 },
    { nome: 'Capacitor 4uF 250V', categoriaId: cats[3]!.id, precoCusto: '5.00', precoVenda: '15.00', estoqueAtual: 20, estoqueMinimo: 10 },
    { nome: 'Bucha Motor Ventilador Eixo 8mm', categoriaId: cats[5]!.id, precoCusto: '2.00', precoVenda: '10.00', estoqueAtual: 50, estoqueMinimo: 20 },
    { nome: 'Motor Liquidificador Arno', categoriaId: cats[4]!.id, precoCusto: '35.00', precoVenda: '80.00', estoqueAtual: 3, estoqueMinimo: 2 },
  ]).returning();

  // 5. Inserir ordens de serviço
  const os = await db
    .insert(ordensServico)
    .values([
      {
        cliente: clis[0]!.nome,
        telefone: clis[0]!.telefone ?? '', // Previne o erro de string | null
        aparelho: 'Ventilador',
        marca: 'Mondial',
        defeito: 'Não gira, faz barulho',
        servico: 'Motor travado, troca de buchas e capacitor',
        pecas: 'Bucha (10.00), Capacitor (15.00)',
        valorTotal: '65.00',
        status: 'Aguardando Avaliação',
      },
      {
        cliente: clis[1]!.nome,
        telefone: clis[1]!.telefone ?? '', // Previne o erro de string | null
        aparelho: 'Liquidificador',
        marca: 'Arno',
        defeito: 'Copo quebrado e não liga',
        servico: 'Troca de copo e revisão do motor',
        pecas: 'Copo novo',
        valorTotal: '75.00',
        status: 'Pronto para Retirada',
      },
    ])
    .returning();

  if (!os[0] || !os[1]) {
    throw new Error("Falha ao retornar os IDs das Ordens de Serviço.");
  }

  // 6. Itens das OS
  await db.insert(osItens).values([
    { ordensServicoId: os[0].id, produtoId: prods[2]!.id, quantidade: 1, precoUnitario: '15.00' },
    { ordensServicoId: os[0].id, produtoId: prods[3]!.id, quantidade: 1, precoUnitario: '10.00' },
    { ordensServicoId: os[1].id, produtoId: prods[1]!.id, quantidade: 1, precoUnitario: '45.00' },
  ]);

  // 7. Vendas de Balcão
  const venda = await db
    .insert(vendasBalcao)
    .values([
      { cliente: clis[2]!.nome, clienteId: clis[2]!.id, valorTotal: '35.00', formaPagamento: 'PIX' },
    ])
    .returning();

  if (!venda[0]) {
    throw new Error("Falha ao retornar o ID da Venda.");
  }

  // 8. Itens da Venda
  await db.insert(vendasItens).values([
    { vendaId: venda[0].id, produtoId: prods[0]!.id, quantidade: 1, precoUnitario: '35.00' },
  ]);

  console.log('✅ Done seeding.');
}

main().catch(console.error);