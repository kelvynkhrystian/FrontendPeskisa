import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', backgroundColor: '#f8fafc' },
  coverPage: {
    padding: 35,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  coverCenterContent: {
    marginVertical: 'auto',
    alignItems: 'center',
  },
  logoImage: { height: 180, objectFit: 'contain', marginBottom: 20 },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'black',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: 8,
  },
  subTitleText: {
    fontSize: 13,
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 30,
  },
  directorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  headerDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#64748b',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'black',
    textTransform: 'uppercase',
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
    paddingLeft: 8,
    marginBottom: 15,
    color: '#0f172a',
  },
  paragraph: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 14,
  },

  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 3,
    fontWeight: 'black',
  },
  value: {
    fontSize: 12,
    color: '#334155',
    fontWeight: 'bold',
    lineHeight: 1.4,
  },

  footer: {
    position: 'absolute',
    bottom: 15,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },

  catTitle: {
    fontSize: 15,
    fontWeight: 'black',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    color: '#0f172a',
    letterSpacing: 1,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ea580c',
    marginBottom: 12,
    marginTop: 10,
    color: '#1e293b',
  },

  questionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  questionNumberBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#ea580c',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  questionNumberText: { color: '#ffffff', fontSize: 11, fontWeight: 'black' },
  questionTitle: {
    fontSize: 12,
    fontWeight: 'black',
    textTransform: 'uppercase',
    color: '#0f172a',
    flex: 1,
  },

  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  legendDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#15803d',
    marginRight: 4,
  },
  legendDotOrange: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ea580c',
    marginRight: 4,
  },
  legendText: {
    fontSize: 8,
    fontWeight: 'black',
    color: '#475569',
    textTransform: 'uppercase',
  },

  optionContainer: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  optionNameText: {
    fontSize: 10,
    fontWeight: 'black',
    color: '#1e293b',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  barBg: {
    height: 9,
    backgroundColor: '#f1f5f9',
    borderRadius: 4.5,
    width: '100%',
    overflow: 'hidden',
  },
  barGreen: { height: '100%', backgroundColor: '#15803d', borderRadius: 4.5 },
  barOrange: { height: '100%', backgroundColor: '#ea580c', borderRadius: 4.5 },

  splitRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  splitPctText: {
    fontSize: 9,
    fontWeight: 'black',
    color: '#475569',
    width: 40,
    textAlign: 'right',
  },

  vfInnerCard: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  vfSubTitle: {
    fontSize: 10,
    fontWeight: 'black',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 6,
  },
});

interface PDFProps {
  pesquisaInfo: any;
  configPdf: any;
  configSistema: any;
  groupedByCategory: Record<string, any[]>;
  perguntasVisiveis: any[];
  calcularEstatisticasPergunta: Function;
  currentSplitKey: string | undefined;
  perfisPorSessao: any;
  mapeamentoPaginas?: Record<string, number>; // Adicionado para receber as páginas do backend
}

export const RelatorioPDFDocument: React.FC<PDFProps> = ({
  pesquisaInfo,
  configPdf,
  configSistema,
  groupedByCategory,
  perguntasVisiveis,
  calcularEstatisticasPergunta,
  currentSplitKey,
  perfisPorSessao,
  mapeamentoPaginas = {},
}) => {
  const anoAtual = new Date().getFullYear();
  const nomeEmpresa = configSistema?.nome_app || 'Vibe Opinião';

  const apiUrl =
    (import.meta as any).env?.VITE_API_URL || 'http://localhost:3333';
  const logoUrl = `${apiUrl}/uploads/logo.png`;

  const Footer = () => (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `${anoAtual} ${nomeEmpresa} ® – Todos os direitos reservados – Proibida a publicação Art. 33 e 35 Lei no 9.504/97    Página ${pageNumber} de ${totalPages}`
      }
    />
  );

  // Lista organizada de todos os grupos
  const allGroups: { catName: string; grupo: any }[] = [];
  Object.entries(groupedByCategory).forEach(([catName, grupos]) => {
    grupos.forEach((grupo) => {
      allGroups.push({ catName, grupo });
    });
  });

  return (
    <Document>
      {/* ---------------- 1. CAPA (Página 1) ---------------- */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.headerDiv}>
          <Text style={styles.headerText}>{nomeEmpresa} • Capa</Text>
          <Text style={styles.headerText}>{pesquisaInfo?.titulo}</Text>
        </View>

        <View style={styles.coverCenterContent}>
          <Image src={logoUrl} style={styles.logoImage} />
          <Text style={styles.mainTitle}>
            {configPdf?.titulo_relatorio || pesquisaInfo?.titulo}
          </Text>
          <Text style={styles.subTitleText}>
            Relatório de Resultados Oficiais
          </Text>
          <Text style={styles.directorText}>
            Diretor Responsável:{' '}
            {configPdf?.diretor_responsavel || 'Não Informado'}
          </Text>
        </View>

        <Footer />
      </Page>

      {/* ---------------- 2. SUMÁRIO (Página 2) ---------------- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerDiv}>
          <Text style={styles.headerText}>{nomeEmpresa} • Sumário</Text>
          <Text style={styles.headerText}>{pesquisaInfo?.titulo}</Text>
        </View>
        <Text style={styles.sectionTitle}>Sumário de Dados</Text>
        <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 15 }}>
          Índice de recortes, faixas e cruzamentos estatísticos.
        </Text>

        <View style={{ marginTop: 5 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              paddingLeft: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
              paddingBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#475569',
                textTransform: 'uppercase',
              }}
            >
              Institucional (Sobre a Empresa)
            </Text>
            <Text
              style={{ fontSize: 10, fontWeight: 'black', color: '#ea580c' }}
            >
              Pág. 3
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              paddingLeft: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
              paddingBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#475569',
                textTransform: 'uppercase',
              }}
            >
              Ficha Técnica da Pesquisa
            </Text>
            <Text
              style={{ fontSize: 10, fontWeight: 'black', color: '#ea580c' }}
            >
              Pág. 4
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 15,
              paddingLeft: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
              paddingBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#475569',
                textTransform: 'uppercase',
              }}
            >
              Análise e Especificações Técnicas
            </Text>
            <Text
              style={{ fontSize: 10, fontWeight: 'black', color: '#ea580c' }}
            >
              Pág. 5
            </Text>
          </View>

          {/* Sumário dinâmico utilizando o mapeamento real retornado pelo backend */}
          {allGroups.map((item, idx) => {
            const paginaReal = mapeamentoPaginas[item.grupo.nome] || 6;
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                  paddingLeft: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f1f5f9',
                  paddingBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#475569',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.catName ? `${item.catName} - ` : ''}
                  {item.grupo.nome}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 'black',
                    color: '#ea580c',
                  }}
                >
                  Pág. {paginaReal}
                </Text>
              </View>
            );
          })}
        </View>
        <Footer />
      </Page>

      {/* ---------------- 3. INSTITUCIONAL (Página 3) ---------------- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerDiv}>
          <Text style={styles.headerText}>{nomeEmpresa} • Institucional</Text>
          <Text style={styles.headerText}>{pesquisaInfo?.titulo}</Text>
        </View>
        <Text style={styles.sectionTitle}>Sobre a Empresa</Text>
        <Text style={styles.paragraph}>
          {configPdf?.sobre_empresa ||
            'A Vibe Opinião é uma plataforma especializada em inteligência de dados, sondagens eleitorais e pesquisas de opinião pública.'}
        </Text>
        <Footer />
      </Page>

      {/* ---------------- 4. FICHA TÉCNICA (Página 4) ---------------- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerDiv}>
          <Text style={styles.headerText}>{nomeEmpresa} • Ficha Técnica</Text>
          <Text style={styles.headerText}>{pesquisaInfo?.titulo}</Text>
        </View>
        <Text style={styles.sectionTitle}>Dados da Pesquisa</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Período de Campo</Text>
          <Text style={styles.value}>{configPdf?.periodo_campo || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contratante</Text>
          <Text style={styles.value}>{configPdf?.contratante || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Porcentagem Pesquisada</Text>
          <Text style={styles.value}>
            {configPdf?.porcentagem_pesquisada || '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tamanho da Amostra</Text>
          <Text style={styles.value}>{configPdf?.tamanho_amostra || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Objetivo</Text>
          <Text style={styles.value}>{configPdf?.objetivo || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Metodologia Utilizada</Text>
          <Text style={styles.value}>{configPdf?.metodologia || '-'}</Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Público Investigado</Text>
          <Text style={styles.value}>
            {configPdf?.publico_investigado || '-'}
          </Text>
        </View>
        <Footer />
      </Page>

      {/* ---------------- 5. ANÁLISE E ESPECIFICAÇÕES TÉCNICAS (Página 5) ---------------- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerDiv}>
          <Text style={styles.headerText}>{nomeEmpresa} • Análise Técnica</Text>
          <Text style={styles.headerText}>{pesquisaInfo?.titulo}</Text>
        </View>

        <Text style={styles.sectionTitle}>
          Análise e Interpretação de Resultado
        </Text>
        <Text style={styles.paragraph}>
          {configPdf?.analise_resultado ||
            'As amostras de intenção de voto obtidas, pesquisadas pela empresa, foram analisadas dentro do processo eleitoral, considerando que são retratadas em momentos políticos. Desta forma, as pesquisas eleitorais tornam-se uma fonte de evidências no contexto analisado.'}
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
          Especificações Técnicas
        </Text>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Fórmula Aplicada</Text>
          <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.5 }}>
            {configPdf?.formula_aplicada ||
              'A distribuição das entrevistas entre os diversos segmentos da comunidade pesquisada foi feita com limites de quotas definidas e com base em dados censitária.'}
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Setores da Pesquisa</Text>
          <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.5 }}>
            {configPdf?.setores_pesquisa ||
              'Áreas que envolve Centro, Ruas e Bairros da Zona Urbana e Povoados da Zona Rural do município.'}
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Coletores de Dados</Text>
          <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.5 }}>
            {configPdf?.coletores_dados ||
              'As entrevistas foram realizadas por uma equipe de entrevistadores devidamente treinada e orientada para a abordagem ao público.'}
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Margem de Erro</Text>
          <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.5 }}>
            {configPdf?.margem_erro ||
              'A margem de erro máximo decorrente desse processo de amostragem é de 2,5 pontos percentuais para mais ou para menos, considerando um nível de confiança de 95%.'}
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Coordenação Estatística</Text>
          <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.5 }}>
            {configPdf?.coordenacao_estatistica || 'Não Informado'}
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Analista Técnico</Text>
          <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.5 }}>
            {configPdf?.analista_tecnico || 'Não Informado'}
          </Text>
        </View>

        <Footer />
      </Page>

      {/* ---------------- 6+. PÁGINAS ISOLADAS POR GRUPO (BREAK EXATO) ---------------- */}
      {allGroups.map((item, gIdx) => (
        <Page key={gIdx} size="A4" style={styles.page}>
          <Footer />
          <View style={styles.headerDiv} fixed>
            <Text style={styles.headerText}>
              {nomeEmpresa} • Dados Coletados
            </Text>
            <Text
              style={styles.headerText}
              render={({ pageNumber }) =>
                `${pesquisaInfo?.titulo}  •  Pág. ${pageNumber}`
              }
            />
          </View>

          {item.catName && <Text style={styles.catTitle}>{item.catName}</Text>}
          {item.grupo.nome !== 'Geral' && (
            <Text style={styles.groupTitle}>{item.grupo.nome}</Text>
          )}

          {perguntasVisiveis.map((pergunta, index) => {
            const resultado = calcularEstatisticasPergunta(
              pergunta,
              item.grupo.respostas,
              currentSplitKey,
              perfisPorSessao
            );
            const isSplit = resultado.splitValues.length > 1;

            return (
              <View key={pergunta.id} style={styles.questionCard} wrap={false}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionHeaderLeft}>
                    <View style={styles.questionNumberBadge}>
                      <Text style={styles.questionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.questionTitle}>{pergunta.titulo}</Text>
                  </View>

                  {isSplit && (
                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={styles.legendDotGreen} />
                        <Text style={styles.legendText}>Masculino</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={styles.legendDotOrange} />
                        <Text style={styles.legendText}>Feminino</Text>
                      </View>
                    </View>
                  )}
                </View>

                {resultado.tipo === 'opcoes' && (
                  <View>
                    {resultado.opcoes.map((opcao: any, i: number) => {
                      if (isSplit) {
                        const pctMasculino =
                          opcao.splits['Masculino']?.porcentagem || 0;
                        const pctFeminino =
                          opcao.splits['Feminino']?.porcentagem || 0;

                        return (
                          <View key={i} style={styles.optionContainer}>
                            <Text style={styles.optionNameText}>
                              {opcao.texto}
                            </Text>
                            <View style={styles.splitRowContainer}>
                              <View style={{ flex: 1 }}>
                                <View style={styles.barBg}>
                                  <View
                                    style={[
                                      styles.barGreen,
                                      { width: `${pctMasculino}%` },
                                    ]}
                                  />
                                </View>
                              </View>
                              <Text style={styles.splitPctText}>
                                {pctMasculino}%
                              </Text>
                            </View>
                            <View style={styles.splitRowContainer}>
                              <View style={{ flex: 1 }}>
                                <View style={styles.barBg}>
                                  <View
                                    style={[
                                      styles.barOrange,
                                      { width: `${pctFeminino}%` },
                                    ]}
                                  />
                                </View>
                              </View>
                              <Text style={styles.splitPctText}>
                                {pctFeminino}%
                              </Text>
                            </View>
                          </View>
                        );
                      } else {
                        const pctGeral =
                          opcao.splits['Geral']?.porcentagem || 0;
                        return (
                          <View key={i} style={styles.optionContainer}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 3,
                              }}
                            >
                              <Text style={styles.optionNameText}>
                                {opcao.texto}
                              </Text>
                              <Text style={styles.splitPctText}>
                                {pctGeral}%
                              </Text>
                            </View>
                            <View style={styles.barBg}>
                              <View
                                style={[
                                  styles.barOrange,
                                  { width: `${pctGeral}%` },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      }
                    })}
                  </View>
                )}

                {resultado.tipo === 'verdadeiro_falso_com_opcoes' && (
                  <View>
                    {resultado.subItens?.map((sub: any, idx: number) => {
                      if (isSplit) {
                        const vM = sub.splits['Masculino']?.verdadeiro || 0;
                        const fM = sub.splits['Masculino']?.falso || 0;
                        const vF = sub.splits['Feminino']?.verdadeiro || 0;
                        const fF = sub.splits['Feminino']?.falso || 0;

                        return (
                          <View key={idx} style={styles.vfInnerCard}>
                            <Text style={styles.vfSubTitle}>{sub.texto}</Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 8,
                                  fontWeight: 'bold',
                                  color: '#475569',
                                }}
                              >
                                VERDADEIRO
                              </Text>
                            </View>
                            <View style={styles.splitRowContainer}>
                              <View style={{ flex: 1 }}>
                                <View style={styles.barBg}>
                                  <View
                                    style={[
                                      styles.barGreen,
                                      { width: `${vM}%` },
                                    ]}
                                  />
                                </View>
                              </View>
                              <Text style={styles.splitPctText}>M:{vM}%</Text>
                            </View>
                            <View
                              style={[
                                styles.splitRowContainer,
                                { marginBottom: 6 },
                              ]}
                            >
                              <View style={{ flex: 1 }}>
                                <View style={styles.barBg}>
                                  <View
                                    style={[
                                      styles.barOrange,
                                      { width: `${vF}%` },
                                    ]}
                                  />
                                </View>
                              </View>
                              <Text style={styles.splitPctText}>F:{vF}%</Text>
                            </View>

                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 8,
                                  fontWeight: 'bold',
                                  color: '#475569',
                                }}
                              >
                                FALSO
                              </Text>
                            </View>
                            <View style={styles.splitRowContainer}>
                              <View style={{ flex: 1 }}>
                                <View style={styles.barBg}>
                                  <View
                                    style={[
                                      styles.barGreen,
                                      { width: `${fM}%` },
                                    ]}
                                  />
                                </View>
                              </View>
                              <Text style={styles.splitPctText}>M:{fM}%</Text>
                            </View>
                            <View style={styles.splitRowContainer}>
                              <View style={{ flex: 1 }}>
                                <View style={styles.barBg}>
                                  <View
                                    style={[
                                      styles.barOrange,
                                      { width: `${fF}%` },
                                    ]}
                                  />
                                </View>
                              </View>
                              <Text style={styles.splitPctText}>F:{fF}%</Text>
                            </View>
                          </View>
                        );
                      } else {
                        const vGeral = sub.splits['Geral']?.verdadeiro || 0;
                        const fGeral = sub.splits['Geral']?.falso || 0;

                        return (
                          <View key={idx} style={styles.vfInnerCard}>
                            <Text style={styles.vfSubTitle}>{sub.texto}</Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: 'bold',
                                  color: '#475569',
                                }}
                              >
                                VERDADEIRO
                              </Text>
                              <Text style={styles.splitPctText}>{vGeral}%</Text>
                            </View>
                            <View style={[styles.barBg, { marginBottom: 6 }]}>
                              <View
                                style={[
                                  styles.barGreen,
                                  { width: `${vGeral}%` },
                                ]}
                              />
                            </View>

                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: 'bold',
                                  color: '#475569',
                                }}
                              >
                                FALSO
                              </Text>
                              <Text style={styles.splitPctText}>{fGeral}%</Text>
                            </View>
                            <View style={styles.barBg}>
                              <View
                                style={[
                                  styles.barOrange,
                                  { width: `${fGeral}%` },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      }
                    })}
                  </View>
                )}

                {resultado.tipo === 'texto' && (
                  <View style={{ paddingLeft: 6 }}>
                    {resultado.textos && resultado.textos.length > 0 ? (
                      resultado.textos.map((t: any, idx: number) => (
                        <Text
                          key={idx}
                          style={{
                            fontSize: 9.5,
                            marginBottom: 4,
                            color: '#334155',
                            fontWeight: 'bold',
                          }}
                        >
                          • {t.quantidade > 1 ? `${t.quantidade}x - ` : ''} "
                          {t.texto}"
                        </Text>
                      ))
                    ) : (
                      <Text
                        style={{
                          fontSize: 9.5,
                          color: '#a1a1aa',
                          fontStyle: 'italic',
                        }}
                      >
                        Nenhuma resposta registrada.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
};
