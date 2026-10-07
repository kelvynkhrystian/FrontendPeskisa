// import { api } from './api';
import { dbLocal } from './dbLocal';
import { pesquisaService } from './pesquisaService';
import { perguntaService } from './perguntaService';
import { perguntaOpcaoService } from './perguntaOpcaoService';

export const syncService = {
  async baixarDadosParaOffline() {
    if (!navigator.onLine) return;

    try {
      const resPesquisas = await pesquisaService.getAll();
      const listaPesquisas = resPesquisas.pesquisas || resPesquisas || [];

      if (listaPesquisas.length > 0) {
        await dbLocal.pesquisas.clear();
        await dbLocal.pesquisas.bulkPut(listaPesquisas);

        // Limpa tabelas antigas de perguntas e opções locais
        await dbLocal.perguntas.clear();
        await dbLocal.opcoes.clear();

        for (const p of listaPesquisas) {
          try {
            const resPerguntas = await perguntaService.getAll({
              pesquisa_id: p.id,
            });
            const listaPerguntas = resPerguntas.perguntas || resPerguntas || [];
            const filtradas = listaPerguntas.filter(
              (item: any) => Number(item.pesquisa_id) === Number(p.id)
            );

            if (filtradas.length > 0) {
              await dbLocal.perguntas.bulkPut(filtradas);

              const resOpcoes = await perguntaOpcaoService.getAll();
              const todasOpcoes = resOpcoes.opcoes || resOpcoes || [];

              for (const pergunta of filtradas) {
                const opcoesPergunta = todasOpcoes.filter(
                  (o: any) => Number(o.pergunta_id) === Number(pergunta.id)
                );
                if (opcoesPergunta.length > 0) {
                  await dbLocal.opcoes.bulkPut(opcoesPergunta);
                }
              }
            }
          } catch (err) {
            console.error(`Erro ao salvar cache da pesquisa ${p.id}:`, err);
          }
        }
        console.log(
          '📦 Cache completo de pesquisas, perguntas e opções salvo no Dexie!'
        );
      }
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    }
  },
};
