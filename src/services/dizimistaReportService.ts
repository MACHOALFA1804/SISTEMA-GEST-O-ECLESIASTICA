import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DizimistaService, DizimistaRow, ContribuicaoRow, EstatisticasContribuicao } from './dizimistaService';

// Interfaces para relatórios de dizimistas
export interface RelatorioContribuicoesData {
  titulo: string;
  subtitulo?: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  contribuicoes: ContribuicaoRow[];
  estatisticas: EstatisticasContribuicao;
  filtros?: {
    tipo_contribuicao?: string;
    dizimista_id?: string;
    forma_pagamento?: string;
  };
}

export interface RelatorioDizimistasData {
  titulo: string;
  subtitulo?: string;
  dizimistas: DizimistaRow[];
  estatisticas: {
    total: number;
    ativos: number;
    inativos: number;
    suspensos: number;
  };
  filtros?: {
    status?: string;
    nome?: string;
  };
}

// Classe principal para geração de relatórios de dizimistas
export class DizimistaReportService {
  
  // Gerar relatório de contribuições em PDF
  static async gerarRelatorioContribuicoesPDF(
    periodo: { inicio: string; fim: string },
    filtros?: {
      tipo_contribuicao?: string;
      dizimista_id?: string;
      forma_pagamento?: string;
    }
  ): Promise<void> {
    try {
      console.log('Iniciando geração de relatório de contribuições...');
      
      // Buscar dados
      const contribuicoes = await DizimistaService.listarContribuicoes({
        data_inicio: periodo.inicio,
        data_fim: periodo.fim,
        tipo_contribuicao: filtros?.tipo_contribuicao,
        dizimista_id: filtros?.dizimista_id,
        limite: 1000 // Limite alto para relatórios
      });

      const estatisticas = await DizimistaService.obterEstatisticas({
        data_inicio: periodo.inicio,
        data_fim: periodo.fim
      });

      // Criar PDF
      const doc = new jsPDF();
      let yPosition = 20;

      // Header
      yPosition = this.adicionarHeader(doc, 'Relatório de Contribuições', yPosition);
      
      // Informações do período
      yPosition = this.adicionarInformacoesPeriodo(doc, periodo, filtros, yPosition);
      
      // Estatísticas resumidas
      yPosition = this.adicionarEstatisticasContribuicoes(doc, estatisticas, yPosition);
      
      // Tabela de contribuições
      yPosition = this.adicionarTabelaContribuicoes(doc, contribuicoes, yPosition);
      
      // Análise por tipo de contribuição
      yPosition = this.adicionarAnalisePorTipo(doc, estatisticas.contribuicoesPorTipo, yPosition);
      
      // Footer
      this.adicionarFooter(doc);

      // Salvar PDF
      const filename = `relatorio_contribuicoes_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`;
      doc.save(filename);
      
      console.log('Relatório de contribuições gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar relatório de contribuições:', error);
      throw error;
    }
  }

  // Gerar relatório de dizimistas em PDF
  static async gerarRelatorioDizimistasPDF(
    filtros?: {
      status?: string;
      nome?: string;
    }
  ): Promise<void> {
    try {
      console.log('Iniciando geração de relatório de dizimistas...');
      
      // Buscar dados
      const dizimistas = await DizimistaService.listarDizimistas({
        status: filtros?.status !== 'Todos' ? filtros?.status : undefined,
        nome: filtros?.nome,
        limite: 1000
      });

      // Calcular estatísticas
      const estatisticas = {
        total: dizimistas.length,
        ativos: dizimistas.filter(d => d.status === 'Ativo').length,
        inativos: dizimistas.filter(d => d.status === 'Inativo').length,
        suspensos: dizimistas.filter(d => d.status === 'Suspenso').length
      };

      // Criar PDF
      const doc = new jsPDF();
      let yPosition = 20;

      // Header
      yPosition = this.adicionarHeader(doc, 'Relatório de Dizimistas', yPosition);
      
      // Informações dos filtros
      yPosition = this.adicionarInformacoesFiltros(doc, filtros, yPosition);
      
      // Estatísticas resumidas
      yPosition = this.adicionarEstatisticasDizimistas(doc, estatisticas, yPosition);
      
      // Tabela de dizimistas
      yPosition = this.adicionarTabelaDizimistas(doc, dizimistas, yPosition);
      
      // Footer
      this.adicionarFooter(doc);

      // Salvar PDF
      const filename = `relatorio_dizimistas_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`;
      doc.save(filename);
      
      console.log('Relatório de dizimistas gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar relatório de dizimistas:', error);
      throw error;
    }
  }

  // Gerar relatório consolidado (dizimistas + contribuições)
  static async gerarRelatorioConsolidadoPDF(
    periodo: { inicio: string; fim: string }
  ): Promise<void> {
    try {
      console.log('Iniciando geração de relatório consolidado...');
      
      // Buscar dados
      const [contribuicoes, dizimistas, estatisticas] = await Promise.all([
        DizimistaService.listarContribuicoes({
          data_inicio: periodo.inicio,
          data_fim: periodo.fim,
          limite: 1000
        }),
        DizimistaService.listarDizimistas({ status: 'Ativo', limite: 1000 }),
        DizimistaService.obterEstatisticas({
          data_inicio: periodo.inicio,
          data_fim: periodo.fim
        })
      ]);

      // Criar PDF
      const doc = new jsPDF();
      let yPosition = 20;

      // Header
      yPosition = this.adicionarHeader(doc, 'Relatório Consolidado - Dizimistas e Contribuições', yPosition);
      
      // Informações do período
      yPosition = this.adicionarInformacoesPeriodo(doc, periodo, undefined, yPosition);
      
      // Resumo executivo
      yPosition = this.adicionarResumoExecutivo(doc, estatisticas, dizimistas.length, yPosition);
      
      // Estatísticas de contribuições
      yPosition = this.adicionarEstatisticasContribuicoes(doc, estatisticas, yPosition);
      
      // Top 10 contribuintes
      yPosition = this.adicionarTopContribuintes(doc, contribuicoes, yPosition);
      
      // Análise temporal
      yPosition = this.adicionarAnaliseTemporal(doc, estatisticas.contribuicoesPorMes, yPosition);
      
      // Footer
      this.adicionarFooter(doc);

      // Salvar PDF
      const filename = `relatorio_consolidado_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`;
      doc.save(filename);
      
      console.log('Relatório consolidado gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar relatório consolidado:', error);
      throw error;
    }
  }

  // Métodos privados para construção do PDF
  private static adicionarHeader(doc: jsPDF, titulo: string, yPos: number): number {
    let y = yPos;
    
    // Nome da igreja
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Assembleia de Deus Vila Evangélica', 20, y);
    y += 6;

    // Endereço
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestão de Dizimistas - TEFILIN v1', 20, y);
    y += 10;

    // Linha separadora
    doc.line(20, y, 190, y);
    y += 8;

    // Título do relatório
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 20, y);
    y += 6;

    // Data de geração
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      150,
      20
    );

    return y + 5;
  }

  private static adicionarInformacoesPeriodo(
    doc: jsPDF, 
    periodo: { inicio: string; fim: string }, 
    filtros: any, 
    yPos: number
  ): number {
    let y = yPos;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações do Relatório:', 20, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    
    // Período
    const periodText = `Período: ${format(new Date(periodo.inicio), 'dd/MM/yyyy', { locale: ptBR })} até ${format(new Date(periodo.fim), 'dd/MM/yyyy', { locale: ptBR })}`;
    doc.text(periodText, 20, y);
    y += 4;

    // Filtros aplicados
    if (filtros) {
      const filtrosTexto = [];
      if (filtros.tipo_contribuicao) filtrosTexto.push(`Tipo: ${filtros.tipo_contribuicao}`);
      if (filtros.forma_pagamento) filtrosTexto.push(`Pagamento: ${filtros.forma_pagamento}`);
      
      if (filtrosTexto.length > 0) {
        doc.text(`Filtros: ${filtrosTexto.join(', ')}`, 20, y);
        y += 4;
      }
    }

    return y + 5;
  }

  private static adicionarInformacoesFiltros(doc: jsPDF, filtros: any, yPos: number): number {
    let y = yPos;

    if (filtros && (filtros.status || filtros.nome)) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros Aplicados:', 20, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      
      if (filtros.status && filtros.status !== 'Todos') {
        doc.text(`Status: ${filtros.status}`, 20, y);
        y += 4;
      }
      
      if (filtros.nome) {
        doc.text(`Nome: ${filtros.nome}`, 20, y);
        y += 4;
      }

      y += 5;
    }

    return y;
  }

  private static adicionarEstatisticasContribuicoes(doc: jsPDF, stats: EstatisticasContribuicao, yPos: number): number {
    let y = yPos;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Estatísticas de Contribuições', 20, y);
    y += 8;

    // Criar tabela de estatísticas
    const statsData = [
      ['Total de Dízimos', `R$ ${stats.totalDizimos.toFixed(2).replace('.', ',')}`],
      ['Total de Ofertas', `R$ ${stats.totalOfertas.toFixed(2).replace('.', ',')}`],
      ['Total Geral', `R$ ${stats.totalGeral.toFixed(2).replace('.', ',')}`],
      ['Último Mês', `R$ ${stats.ultimoMes.toFixed(2).replace('.', ',')}`],
      ['Média Mensal', `R$ ${stats.mediaAnual.toFixed(2).replace('.', ',')}`],
      ['Total de Contribuintes', stats.totalContribuintes.toString()]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: statsData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static adicionarEstatisticasDizimistas(doc: jsPDF, stats: any, yPos: number): number {
    let y = yPos;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Estatísticas de Dizimistas', 20, y);
    y += 8;

    const statsData = [
      ['Total de Dizimistas', stats.total.toString()],
      ['Ativos', stats.ativos.toString()],
      ['Inativos', stats.inativos.toString()],
      ['Suspensos', stats.suspensos.toString()]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Status', 'Quantidade']],
      body: statsData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static adicionarTabelaContribuicoes(doc: jsPDF, contribuicoes: ContribuicaoRow[], yPos: number): number {
    let y = yPos;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Contribuições', 20, y);
    y += 8;

    // Preparar dados da tabela
    const tableData = contribuicoes.slice(0, 50).map(contrib => [
      (contrib as any).dizimistas?.nome || 'N/A',
      contrib.tipo_contribuicao || 'N/A',
      `R$ ${contrib.valor.toFixed(2).replace('.', ',')}`,
      format(new Date(contrib.data_contribuicao), 'dd/MM/yyyy', { locale: ptBR }),
      contrib.forma_pagamento || 'N/A'
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Dizimista', 'Tipo', 'Valor', 'Data', 'Pagamento']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 8
      },
      margin: { left: 20, right: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 2
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    if (contribuicoes.length > 50) {
      doc.setFontSize(9);
      doc.text(`* Mostrando apenas as primeiras 50 contribuições de ${contribuicoes.length} total`, 20, finalY + 5);
      finalY += 10;
    }

    return finalY + 10;
  }

  private static adicionarTabelaDizimistas(doc: jsPDF, dizimistas: DizimistaRow[], yPos: number): number {
    let y = yPos;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Dizimistas', 20, y);
    y += 8;

    const tableData = dizimistas.slice(0, 50).map(dizimista => [
      dizimista.nome || 'N/A',
      dizimista.telefone || 'N/A',
      dizimista.email || 'N/A',
      dizimista.status || 'N/A',
      dizimista.created_at ? format(new Date(dizimista.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Nome', 'Telefone', 'Email', 'Status', 'Cadastro']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 8
      },
      margin: { left: 20, right: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 2
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    if (dizimistas.length > 50) {
      doc.setFontSize(9);
      doc.text(`* Mostrando apenas os primeiros 50 dizimistas de ${dizimistas.length} total`, 20, finalY + 5);
      finalY += 10;
    }

    return finalY + 10;
  }

  private static adicionarAnalisePorTipo(doc: jsPDF, contribuicoesPorTipo: { [key: string]: number }, yPos: number): number {
    let y = yPos;

    if (Object.keys(contribuicoesPorTipo).length === 0) return y;

    // Verificar se precisa de nova página
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise por Tipo de Contribuição', 20, y);
    y += 8;

    const tipoData = Object.entries(contribuicoesPorTipo).map(([tipo, valor]) => [
      tipo,
      `R$ ${valor.toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Tipo de Contribuição', 'Valor Total']],
      body: tipoData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static adicionarResumoExecutivo(doc: jsPDF, stats: EstatisticasContribuicao, totalDizimistas: number, yPos: number): number {
    let y = yPos;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Executivo', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const resumoTexto = [
      `• Total arrecadado no período: R$ ${stats.totalGeral.toFixed(2).replace('.', ',')}`,
      `• Dízimos representam ${((stats.totalDizimos / stats.totalGeral) * 100).toFixed(1)}% do total`,
      `• Ofertas representam ${((stats.totalOfertas / stats.totalGeral) * 100).toFixed(1)}% do total`,
      `• Média mensal de contribuições: R$ ${stats.mediaAnual.toFixed(2).replace('.', ',')}`,
      `• Total de ${stats.totalContribuintes} contribuintes ativos de ${totalDizimistas} dizimistas cadastrados`,
      `• Taxa de participação: ${((stats.totalContribuintes / totalDizimistas) * 100).toFixed(1)}%`
    ];

    resumoTexto.forEach(texto => {
      doc.text(texto, 20, y);
      y += 5;
    });

    return y + 10;
  }

  private static adicionarTopContribuintes(doc: jsPDF, contribuicoes: ContribuicaoRow[], yPos: number): number {
    let y = yPos;

    // Calcular top contribuintes
    const contribuintesPorValor: { [key: string]: { nome: string; total: number } } = {};
    
    contribuicoes.forEach(contrib => {
      const dizimistaId = contrib.dizimista_id;
      const nome = (contrib as any).dizimistas?.nome || 'N/A';
      
      if (!contribuintesPorValor[dizimistaId]) {
        contribuintesPorValor[dizimistaId] = { nome, total: 0 };
      }
      contribuintesPorValor[dizimistaId].total += contrib.valor;
    });

    const topContribuintes = Object.values(contribuintesPorValor)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (topContribuintes.length === 0) return y;

    // Verificar se precisa de nova página
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Contribuintes', 20, y);
    y += 8;

    const topData = topContribuintes.map((contrib, index) => [
      (index + 1).toString(),
      contrib.nome,
      `R$ ${contrib.total.toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Posição', 'Nome', 'Total Contribuído']],
      body: topData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static adicionarAnaliseTemporal(doc: jsPDF, contribuicoesPorMes: { mes: string; valor: number }[], yPos: number): number {
    let y = yPos;

    if (contribuicoesPorMes.length === 0) return y;

    // Verificar se precisa de nova página
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise Temporal (Últimos 12 Meses)', 20, y);
    y += 8;

    const temporalData = contribuicoesPorMes.map(item => [
      item.mes,
      `R$ ${item.valor.toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Mês/Ano', 'Valor Total']],
      body: temporalData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static adicionarFooter(doc: jsPDF): void {
    const pageCount = (doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      const y = pageHeight - 15;

      // Linha separadora
      doc.line(20, y - 5, 190, y - 5);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      // Texto do footer
      doc.text('Este relatório é confidencial e destinado apenas ao uso interno da igreja.', 20, y);

      // Timestamp
      const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      doc.text(`Gerado em: ${timestamp}`, 130, y);

      // Número da página
      doc.text(`Página ${i} de ${pageCount}`, 105, y + 5, { align: 'center' });
    }
  }

  // Gerar dados para CSV
  static gerarCSVContribuicoes(contribuicoes: ContribuicaoRow[]): string {
    let csv = 'Nome do Dizimista,Tipo de Contribuição,Valor,Data da Contribuição,Forma de Pagamento,Número do Envelope,Observações\n';
    
    contribuicoes.forEach(contrib => {
      const row = [
        this.escapeCsvField((contrib as any).dizimistas?.nome || ''),
        this.escapeCsvField(contrib.tipo_contribuicao || ''),
        contrib.valor.toFixed(2).replace('.', ','),
        contrib.data_contribuicao ? format(new Date(contrib.data_contribuicao), 'dd/MM/yyyy', { locale: ptBR }) : '',
        this.escapeCsvField(contrib.forma_pagamento || ''),
        this.escapeCsvField(contrib.numero_envelope || ''),
        this.escapeCsvField(contrib.observacoes || '')
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  static gerarCSVDizimistas(dizimistas: DizimistaRow[]): string {
    let csv = 'Nome,Telefone,Email,Endereço,Data de Nascimento,Profissão,Status,Data de Cadastro,Observações\n';
    
    dizimistas.forEach(dizimista => {
      const row = [
        this.escapeCsvField(dizimista.nome || ''),
        this.escapeCsvField(dizimista.telefone || ''),
        this.escapeCsvField(dizimista.email || ''),
        this.escapeCsvField(dizimista.endereco || ''),
        dizimista.data_nascimento ? format(new Date(dizimista.data_nascimento), 'dd/MM/yyyy', { locale: ptBR }) : '',
        this.escapeCsvField(dizimista.profissao || ''),
        this.escapeCsvField(dizimista.status || ''),
        dizimista.created_at ? format(new Date(dizimista.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        this.escapeCsvField(dizimista.observacoes || '')
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private static escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

export default DizimistaReportService;

