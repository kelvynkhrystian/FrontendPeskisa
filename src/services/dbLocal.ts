import Dexie, { Table } from 'dexie';

// Define o formato dos dados que vamos salvar offline
export interface RespostaOffline {
  id?: number; // Auto-incremento (gerado automaticamente)
  pesquisa_id: number;
  pesquisa_titulo: string;
  respostas: any[];
  data_coleta: string;
}

// Cria a classe do Banco de Dados
export class VibeOpiniaoDB extends Dexie {
  respostas_offline!: Table<RespostaOffline>;

  constructor() {
    super('VibeOpiniaoDB');

    // Define a versão do banco e a estrutura das tabelas (stores)
    // O '++id' significa que o ID será gerado automaticamente (1, 2, 3...)
    this.version(1).stores({
      respostas_offline: '++id, pesquisa_id, pesquisa_titulo, data_coleta',
    });
  }
}

// Exporta a instância pronta para usarmos em qualquer lugar do app
export const dbLocal = new VibeOpiniaoDB();
