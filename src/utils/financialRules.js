// src/utils/financialRules.js
export const financialRules = [
  {
    id: '1',
    title: 'Regra 50-30-20',
    description: 'Um método popular para dividir sua renda em três categorias, garantindo que você cubra suas necessidades, desejos e ainda consiga poupar para o futuro.',
    details: [
      {
        percentage: 50,
        category: 'Necessidades Essenciais',
        description: 'Gastos fixos e essenciais que você precisa para viver.',
        examples: ['Aluguel', 'Contas de luz/água', 'Supermercado', 'Transporte'],
        color: '#3B82F6',
      },
      {
        percentage: 30,
        category: 'Desejos Pessoais',
        description: 'Gastos variáveis que melhoram sua qualidade de vida, mas não são essenciais.',
        examples: ['Restaurantes', 'Hobbies', 'Assinaturas de streaming', 'Viagens'],
        color: '#F59E0B',
      },
      {
        percentage: 20,
        category: 'Metas Financeiras',
        description: 'Dinheiro destinado a pagar dívidas, poupar ou investir para o futuro.',
        examples: ['Quitar cartão de crédito', 'Reserva de emergência', 'Investimentos'],
        color: '#10B981',
      },
    ],
  },
  {
    id: '2',
    title: 'Método "Pague-se Primeiro"',
    description: 'Uma estratégia que prioriza a poupança. Assim que receber sua renda, separe uma quantia para seus objetivos antes de começar a pagar as contas.',
    details: [
        {
            percentage: 15,
            category: 'Poupança Prioritária',
            description: 'Assim que receber, transfira no mínimo 15% para uma conta separada destinada a investimentos ou metas de longo prazo.',
            examples: ['Transferência automática', 'Aporte em investimento'],
            color: '#10B981',
        },
        {
            percentage: 85,
            category: 'Gastos do Mês',
            description: 'Use o restante da sua renda para pagar todas as suas despesas, tanto as essenciais quanto os desejos.',
            examples: ['Aluguel', 'Contas', 'Lazer', 'Alimentação'],
            color: '#3B82F6',
        },
    ],
  },
];