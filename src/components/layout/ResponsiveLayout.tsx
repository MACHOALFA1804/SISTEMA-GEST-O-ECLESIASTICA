import React, { useState } from 'react';
import { useResponsive, useResponsiveClasses } from '../../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  className = ''
}) => {
  const responsive = useResponsive();
  const classes = useResponsiveClasses();
  // const [sidebarOpen, setSidebarOpen] = useState(false); // Para uso futuro

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header Mobile */}
      {responsive.isMobile && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className={classes.navigation.header}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showBackButton && onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </button>
                )}
                
                <div>
                  {title && (
                    <h1 className={`${classes.text.title} text-gray-900 truncate`}>
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className={`${classes.text.subtitle} text-gray-600 truncate`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Desktop/Tablet */}
      {!responsive.isMobile && (title || subtitle || showBackButton || actions) && (
        <div className="bg-white shadow-sm border-b">
          <div className={classes.container}>
            <div className={classes.navigation.header}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {showBackButton && onBack && (
                    <button
                      onClick={onBack}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                      <span>Voltar</span>
                    </button>
                  )}
                  
                  <div>
                    {title && (
                      <h1 className={`${classes.text.title} text-gray-900`}>
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className={`${classes.text.subtitle} text-gray-600 mt-1`}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {actions && (
                  <div className="flex items-center gap-3">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className={`${classes.container} ${classes.spacing.section}`}>
        {children}
      </main>
    </div>
  );
};

export default ResponsiveLayout;
