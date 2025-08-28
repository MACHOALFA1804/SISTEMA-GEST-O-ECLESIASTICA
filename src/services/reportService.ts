import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para tipos de relatórios
export interface ReportData {
  title: string;
  subtitle?: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any[];
  metadata?: {
    totalRegistros: number;
    filtrosAplicados: string[];
    geradoPor: string;
    dataGeracao: Date;
  };
}

export interface ReportConfig {
  orientation: 'portrait' | 'landscape';
  format: 'a4' | 'letter';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header: {
    showLogo: boolean;
    showDate: boolean;
    showPage: boolean;
    churchName: string;
    churchAddress: string;
  };
  footer: {
    showSignature: boolean;
    showTimestamp: boolean;
    customText: string;
  };
  styling: {
    fontSize: number;
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  title: string;
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  width?: number;
  height?: number;
}

// Configuração padrão para relatórios
export const defaultReportConfig: ReportConfig = {
  orientation: 'portrait',
  format: 'a4',
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  },
  header: {
    showLogo: true,
    showDate: true,
    showPage: true,
    churchName: 'Assembleia de Deus Vila Evangélica',
    churchAddress: 'Rua da Igreja, 123 - São Paulo, SP'
  },
  footer: {
    showSignature: true,
    showTimestamp: true,
    customText: 'Este relatório é confidencial e destinado apenas ao uso interno da igreja.'
  },
  styling: {
    fontSize: 10,
    fontFamily: 'helvetica',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b'
  }
};

// Classe principal para geração de relatórios
export class ReportService {
  private config: ReportConfig;

  constructor(config: ReportConfig = defaultReportConfig) {
    this.config = config;
  }

  // Gerar relatório de visitantes em PDF
  async generateVisitorsReportPDF(data: ReportData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: this.config.orientation,
      unit: 'mm',
      format: this.config.format
    });

    let yPosition = this.config.margins.top;

    // Header
    yPosition = this.addHeader(pdf, data.title, data.subtitle, yPosition);
    
    // Metadados do relatório
    yPosition = this.addMetadata(pdf, data, yPosition);
    
    // Estatísticas resumidas
    const stats = this.calculateVisitorStats(data.data);
    yPosition = this.addStatisticsSection(pdf, stats, yPosition);
    
    // Tabela de visitantes
    yPosition = this.addVisitorTable(pdf, data.data, yPosition);
    
    // Gráficos
    const chartData = this.prepareChartData(data.data);
    yPosition = await this.addChartsSection(pdf, chartData, yPosition);
    
    // Footer
    this.addFooter(pdf);

    return pdf.output('blob');
  }

  // Gerar relatório de visitas pastorais em PDF
  async generateVisitsReportPDF(data: ReportData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: this.config.orientation,
      unit: 'mm',
      format: this.config.format
    });

    let yPosition = this.config.margins.top;

    // Header
    yPosition = this.addHeader(pdf, data.title, data.subtitle, yPosition);
    
    // Resumo de visitas
    const visitStats = this.calculateVisitStats(data.data);
    yPosition = this.addVisitStatistics(pdf, visitStats, yPosition);
    
    // Lista de visitas realizadas
    yPosition = this.addVisitsList(pdf, data.data, yPosition);
    
    // Próximas visitas agendadas
    const upcomingVisits = data.data.filter((visit: any) => 
      visit.status === 'Agendada' && new Date(visit.data) > new Date()
    );
    yPosition = this.addUpcomingVisits(pdf, upcomingVisits, yPosition);
    
    // Footer
    this.addFooter(pdf);

    return pdf.output('blob');
  }

  // Gerar dados para CSV
  generateCSV(data: ReportData, type: 'visitors' | 'visits' | 'messages'): string {
    let csvContent = '';
    
    // Header com informações do relatório
    csvContent += `Relatório: ${data.title}\n`;
    csvContent += `Período: ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} até ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}\n`;
    csvContent += `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}\n`;
    csvContent += `Total de registros: ${data.metadata?.totalRegistros || data.data.length}\n\n`;

    // Colunas e dados baseados no tipo
    switch (type) {
      case 'visitors':
        csvContent += this.generateVisitorsCSV(data.data);
        break;
      case 'visits':
        csvContent += this.generateVisitsCSV(data.data);
        break;
      case 'messages':
        csvContent += this.generateMessagesCSV(data.data);
        break;
    }

    return csvContent;
  }

  // Métodos privados para construção do PDF
  private addHeader(pdf: jsPDF, title: string, subtitle?: string, yPos?: number): number {
    let y = yPos || this.config.margins.top;
    
    // Logo (se habilitado)
    if (this.config.header.showLogo) {
      // TODO: Adicionar logo quando disponível
      y += 10;
    }

    // Nome da igreja
    pdf.setFontSize(16);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text(this.config.header.churchName, this.config.margins.left, y);
    y += 6;

    // Endereço
    pdf.setFontSize(10);
    pdf.setFont(this.config.styling.fontFamily, 'normal');
    pdf.text(this.config.header.churchAddress, this.config.margins.left, y);
    y += 10;

    // Linha separadora
    pdf.line(this.config.margins.left, y, 200 - this.config.margins.right, y);
    y += 8;

    // Título do relatório
    pdf.setFontSize(14);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text(title, this.config.margins.left, y);
    y += 6;

    // Subtítulo
    if (subtitle) {
      pdf.setFontSize(11);
      pdf.setFont(this.config.styling.fontFamily, 'normal');
      pdf.text(subtitle, this.config.margins.left, y);
      y += 6;
    }

    // Data de geração
    if (this.config.header.showDate) {
      pdf.setFontSize(9);
      pdf.text(
        `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        200 - this.config.margins.right - 40,
        this.config.margins.top + 5
      );
    }

    return y + 5;
  }

  private addMetadata(pdf: jsPDF, data: ReportData, yPos: number): number {
    let y = yPos;

    pdf.setFontSize(10);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Informações do Relatório:', this.config.margins.left, y);
    y += 5;

    pdf.setFont(this.config.styling.fontFamily, 'normal');
    
    // Período
    const periodText = `Período: ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} até ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}`;
    pdf.text(periodText, this.config.margins.left, y);
    y += 4;

    // Total de registros
    pdf.text(`Total de registros: ${data.metadata?.totalRegistros || data.data.length}`, this.config.margins.left, y);
    y += 4;

    // Filtros aplicados
    if (data.metadata?.filtrosAplicados && data.metadata.filtrosAplicados.length > 0) {
      pdf.text(`Filtros: ${data.metadata.filtrosAplicados.join(', ')}`, this.config.margins.left, y);
      y += 4;
    }

    return y + 5;
  }

  private addStatisticsSection(pdf: jsPDF, stats: any, yPos: number): number {
    let y = yPos;

    pdf.setFontSize(12);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Estatísticas Resumidas', this.config.margins.left, y);
    y += 8;

    // Criar tabela de estatísticas
    const statsData = [
      ['Total de Visitantes', stats.total.toString()],
      ['Novos Visitantes', stats.novos.toString()],
      ['Cristãos', stats.cristaos.toString()],
      ['Não Cristãos', stats.naoCristaos.toString()],
      ['Visitados', stats.visitados.toString()],
      ['Pendentes', stats.pendentes.toString()]
    ];

    y = this.addSimpleTable(pdf, ['Categoria', 'Quantidade'], statsData, y);

    return y + 10;
  }

  private addVisitorTable(pdf: jsPDF, visitors: any[], yPos: number): number {
    let y = yPos;

    pdf.setFontSize(12);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Lista de Visitantes', this.config.margins.left, y);
    y += 8;

    // Headers da tabela
    const headers = ['Nome', 'Telefone', 'Tipo', 'Status', 'Data'];
    
    // Dados da tabela
    const tableData = visitors.map(visitor => [
      visitor.nome || 'N/A',
      visitor.telefone || 'N/A',
      visitor.tipo || 'N/A',
      visitor.status || 'N/A',
      visitor.created_at ? format(new Date(visitor.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
    ]);

    y = this.addTable(pdf, headers, tableData, y);

    return y;
  }

  private addSimpleTable(pdf: jsPDF, headers: string[], data: string[][], yPos: number): number {
    let y = yPos;
    const rowHeight = 6;
    const colWidths = [60, 30]; // Larguras das colunas

    // Headers
    pdf.setFontSize(9);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    headers.forEach((header, index) => {
      const x = this.config.margins.left + (index * colWidths[index]);
      pdf.text(header, x, y);
    });
    y += rowHeight;

    // Linha abaixo do header
    pdf.line(this.config.margins.left, y - 2, this.config.margins.left + colWidths.reduce((a, b) => a + b, 0), y - 2);

    // Dados
    pdf.setFont(this.config.styling.fontFamily, 'normal');
    data.forEach(row => {
      row.forEach((cell, index) => {
        const x = this.config.margins.left + (index * colWidths[index]);
        pdf.text(cell, x, y);
      });
      y += rowHeight;
    });

    return y;
  }

  private addTable(pdf: jsPDF, headers: string[], data: string[][], yPos: number): number {
    let y = yPos;
    const rowHeight = 5;
    const colWidths = [40, 30, 25, 25, 20]; // Larguras das colunas
    const maxRowsPerPage = 25;
    let currentRow = 0;

    // Headers
    pdf.setFontSize(8);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    headers.forEach((header, index) => {
      const x = this.config.margins.left + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
      pdf.text(header, x, y);
    });
    y += rowHeight;

    // Linha abaixo do header
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    pdf.line(this.config.margins.left, y - 2, this.config.margins.left + tableWidth, y - 2);

    // Dados
    pdf.setFont(this.config.styling.fontFamily, 'normal');
    data.forEach(row => {
      // Verificar se precisa de nova página
      if (currentRow >= maxRowsPerPage) {
        pdf.addPage();
        y = this.config.margins.top;
        currentRow = 0;
        
        // Repetir headers na nova página
        pdf.setFont(this.config.styling.fontFamily, 'bold');
        headers.forEach((header, index) => {
          const x = this.config.margins.left + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
          pdf.text(header, x, y);
        });
        y += rowHeight;
        pdf.line(this.config.margins.left, y - 2, this.config.margins.left + tableWidth, y - 2);
        pdf.setFont(this.config.styling.fontFamily, 'normal');
      }

      row.forEach((cell, index) => {
        const x = this.config.margins.left + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
        // Truncar texto se muito longo
        const truncatedCell = cell.length > 15 ? cell.substring(0, 12) + '...' : cell;
        pdf.text(truncatedCell, x, y);
      });
      y += rowHeight;
      currentRow++;
    });

    return y;
  }

  private async addChartsSection(pdf: jsPDF, chartData: any, yPos: number): Promise<number> {
    // Por enquanto, vamos adicionar apenas uma seção de placeholder para gráficos
    // Em uma implementação real, você usaria uma biblioteca como Chart.js
    let y = yPos + 10;

    pdf.setFontSize(12);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Análise Gráfica', this.config.margins.left, y);
    y += 8;

    pdf.setFontSize(9);
    pdf.setFont(this.config.styling.fontFamily, 'normal');
    pdf.text('Gráficos de distribuição por tipo de visitante e status serão exibidos aqui.', this.config.margins.left, y);
    y += 6;
    pdf.text('(Funcionalidade de gráficos será implementada em versão futura)', this.config.margins.left, y);

    return y + 10;
  }

  private addFooter(pdf: jsPDF): void {
    const pageHeight = pdf.internal.pageSize.height;
    const y = pageHeight - this.config.margins.bottom;

    // Linha separadora
    pdf.line(this.config.margins.left, y - 5, 200 - this.config.margins.right, y - 5);

    pdf.setFontSize(8);
    pdf.setFont(this.config.styling.fontFamily, 'normal');

    // Texto customizado
    if (this.config.footer.customText) {
      pdf.text(this.config.footer.customText, this.config.margins.left, y);
    }

    // Timestamp
    if (this.config.footer.showTimestamp) {
      const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      pdf.text(`Gerado em: ${timestamp}`, 200 - this.config.margins.right - 30, y);
    }

    // Número da página
    if (this.config.header.showPage) {
      const pageCount = pdf.internal.pages.length - 1;
      pdf.text(`Página 1 de ${pageCount}`, (200 / 2) - 10, y);
    }
  }

  // Métodos para CSV
  private generateVisitorsCSV(visitors: any[]): string {
    let csv = 'Nome,Telefone,Tipo,Status,Quem Acompanha,Congregação Origem,Data Cadastro,Observações\n';
    
    visitors.forEach(visitor => {
      const row = [
        this.escapeCsvField(visitor.nome || ''),
        this.escapeCsvField(visitor.telefone || ''),
        this.escapeCsvField(visitor.tipo || ''),
        this.escapeCsvField(visitor.status || ''),
        this.escapeCsvField(visitor.quem_acompanha || ''),
        this.escapeCsvField(visitor.congregacao_origem || ''),
        visitor.created_at ? format(new Date(visitor.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        this.escapeCsvField(visitor.observacoes || '')
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private generateVisitsCSV(visits: any[]): string {
    let csv = 'Visitante,Data Visita,Status,Pastor Responsável,Observações,Data Agendamento\n';
    
    visits.forEach(visit => {
      const row = [
        this.escapeCsvField(visit.visitante_nome || ''),
        visit.data_visita ? format(new Date(visit.data_visita), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        this.escapeCsvField(visit.status || ''),
        this.escapeCsvField(visit.pastor_responsavel || ''),
        this.escapeCsvField(visit.observacoes || ''),
        visit.created_at ? format(new Date(visit.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private generateMessagesCSV(messages: any[]): string {
    let csv = 'Destinatário,Telefone,Mensagem,Status,Data Envio,Template Usado\n';
    
    messages.forEach(message => {
      const row = [
        this.escapeCsvField(message.destinatario_nome || ''),
        this.escapeCsvField(message.telefone || ''),
        this.escapeCsvField(message.conteudo || ''),
        this.escapeCsvField(message.status || ''),
        message.data_envio ? format(new Date(message.data_envio), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        this.escapeCsvField(message.template_usado || '')
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private escapeCsvField(field: string): string {
    // Escapar aspas duplas e adicionar aspas se contém vírgula, quebra de linha ou aspas
    const escaped = field.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  // Métodos de cálculo de estatísticas
  private calculateVisitorStats(visitors: any[]) {
    return {
      total: visitors.length,
      novos: visitors.filter(v => v.status === 'Aguardando').length,
      cristaos: visitors.filter(v => v.tipo === 'Cristão').length,
      naoCristaos: visitors.filter(v => v.tipo === 'Não Cristão').length,
      visitados: visitors.filter(v => v.status === 'Visitado').length,
      pendentes: visitors.filter(v => v.status === 'Aguardando Visita').length
    };
  }

  private calculateVisitStats(visits: any[]) {
    return {
      total: visits.length,
      realizadas: visits.filter(v => v.status === 'Realizada').length,
      agendadas: visits.filter(v => v.status === 'Agendada').length,
      canceladas: visits.filter(v => v.status === 'Cancelada').length
    };
  }

  private prepareChartData(data: any[]) {
    // Preparar dados para gráficos
    return {
      visitantePorTipo: {
        labels: ['Cristão', 'Não Cristão', 'Pregador', 'Outro'],
        values: [
          data.filter(v => v.tipo === 'Cristão').length,
          data.filter(v => v.tipo === 'Não Cristão').length,
          data.filter(v => v.tipo === 'Pregador').length,
          data.filter(v => v.tipo === 'Outro').length
        ]
      },
      visitantePorStatus: {
        labels: ['Aguardando', 'Aguardando Visita', 'Visitado', 'Novo Membro', 'Pendente'],
        values: [
          data.filter(v => v.status === 'Aguardando').length,
          data.filter(v => v.status === 'Aguardando Visita').length,
          data.filter(v => v.status === 'Visitado').length,
          data.filter(v => v.status === 'Novo Membro').length,
          data.filter(v => v.status === 'Pendente').length
        ]
      }
    };
  }

  private addVisitStatistics(pdf: jsPDF, stats: any, yPos: number): number {
    let y = yPos;

    pdf.setFontSize(12);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Estatísticas de Visitas', this.config.margins.left, y);
    y += 8;

    const statsData = [
      ['Total de Visitas', stats.total.toString()],
      ['Visitas Realizadas', stats.realizadas.toString()],
      ['Visitas Agendadas', stats.agendadas.toString()],
      ['Visitas Canceladas', stats.canceladas.toString()]
    ];

    y = this.addSimpleTable(pdf, ['Categoria', 'Quantidade'], statsData, y);

    return y + 10;
  }

  private addVisitsList(pdf: jsPDF, visits: any[], yPos: number): number {
    let y = yPos;

    pdf.setFontSize(12);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Visitas Realizadas', this.config.margins.left, y);
    y += 8;

    const realizadas = visits.filter(visit => visit.status === 'Realizada');
    
    if (realizadas.length === 0) {
      pdf.setFontSize(9);
      pdf.setFont(this.config.styling.fontFamily, 'normal');
      pdf.text('Nenhuma visita realizada no período.', this.config.margins.left, y);
      return y + 10;
    }

    const headers = ['Visitante', 'Data', 'Pastor', 'Observações'];
    const tableData = realizadas.map(visit => [
      visit.visitante_nome || 'N/A',
      visit.data_visita ? format(new Date(visit.data_visita), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
      visit.pastor_responsavel || 'N/A',
      (visit.observacoes || 'N/A').substring(0, 20) + (visit.observacoes?.length > 20 ? '...' : '')
    ]);

    y = this.addTable(pdf, headers, tableData, y);

    return y + 5;
  }

  private addUpcomingVisits(pdf: jsPDF, visits: any[], yPos: number): number {
    let y = yPos;

    pdf.setFontSize(12);
    pdf.setFont(this.config.styling.fontFamily, 'bold');
    pdf.text('Próximas Visitas Agendadas', this.config.margins.left, y);
    y += 8;

    if (visits.length === 0) {
      pdf.setFontSize(9);
      pdf.setFont(this.config.styling.fontFamily, 'normal');
      pdf.text('Nenhuma visita agendada.', this.config.margins.left, y);
      return y + 10;
    }

    const headers = ['Visitante', 'Data Agendada', 'Pastor', 'Observações'];
    const tableData = visits.map(visit => [
      visit.visitante_nome || 'N/A',
      visit.data_visita ? format(new Date(visit.data_visita), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A',
      visit.pastor_responsavel || 'N/A',
      (visit.observacoes || 'N/A').substring(0, 20) + (visit.observacoes?.length > 20 ? '...' : '')
    ]);

    y = this.addTable(pdf, headers, tableData, y);

    return y;
  }
}

// Funções utilitárias para download
export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Instância global do serviço
export const reportService = new ReportService();
