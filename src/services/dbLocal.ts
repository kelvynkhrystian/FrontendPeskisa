import Dexie, { Table } from 'dexie';

export interface RespostaOffline {
  id?: number;
  pesquisa_id: number;
  pesquisa_titulo: string;
  respostas: any[];
  data_coleta: string;
}

export class VibeOpiniaoDB extends Dexie {
  respostas_offline!: Table<RespostaOffline>;
  pesquisas!: Table<any>;
  perguntas!: Table<any>;
  opcoes!: Table<any>;

  constructor() {
    super('VibeOpiniaoDB');

    // Atualizamos para a versão 2 para incluir as tabelas de cache das pesquisas
    this.version(2).stores({
      respostas_offline: '++id, pesquisa_id, pesquisa_titulo, data_coleta',
      pesquisas: 'id, titulo, status',
      perguntas: 'id, pesquisa_id, ordem',
      opcoes: 'id, pergunta_id, ordem',
    });
  }
}

export const dbLocal = new VibeOpiniaoDB();
