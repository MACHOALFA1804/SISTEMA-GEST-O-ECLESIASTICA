import React from 'react';
import { useResponsive, useResponsiveClasses } from '../../hooks/useResponsive';

interface Column {
  key: string;
  title: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  className = ''
}) => {
  const responsive = useResponsive();
  const classes = useResponsiveClasses();

  // Filtrar colunas baseado no dispositivo
  const visibleColumns = columns.filter(column => {
    if (responsive.isMobile && column.hideOnMobile) return false;
    if (responsive.isTablet && column.hideOnTablet) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Renderização mobile (cards)
  if (responsive.isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((row, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm border p-4 ${
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {visibleColumns.map((column) => {
              const value = row[column.key];
              const displayValue = column.render ? column.render(value, row) : value;
              
              return (
                <div key={column.key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700 flex-shrink-0 w-1/3">
                    {column.title}:
                  </span>
                  <span className="text-sm text-gray-900 flex-1 text-right">
                    {displayValue || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Renderização desktop/tablet (tabela tradicional)
  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      <div className={classes.grid.table}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width ? `w-${column.width}` : ''
                  }`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`${
                  onRowClick 
                    ? 'cursor-pointer hover:bg-gray-50 transition-colors' 
                    : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map((column) => {
                  const value = row[column.key];
                  const displayValue = column.render ? column.render(value, row) : value;
                  
                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayValue || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;
