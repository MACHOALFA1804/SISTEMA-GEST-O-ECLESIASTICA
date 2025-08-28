import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, Permission, UserRole } from '../../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Verificando permissões...' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const AccessDenied: React.FC<{ message?: string }> = ({ 
  message = 'Acesso negado. Você não tem permissão para acessar esta página.' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar
      </button>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback,
  redirectTo = '/'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        setIsLoading(true);
        
        // Validar sessão primeiro
        const isSessionValid = await authService.validateSession();
        
        if (!isSessionValid) {
          setIsAuthorized(false);
          setErrorMessage('Sessão expirada. Faça login novamente.');
          return;
        }

        const securityContext = authService.getSecurityContext();
        
        if (!securityContext.isAuthenticated) {
          setIsAuthorized(false);
          setErrorMessage('Você precisa estar logado para acessar esta página.');
          return;
        }

        // Verificar role se especificado
        if (requiredRole && !securityContext.hasRole(requiredRole)) {
          setIsAuthorized(false);
          setErrorMessage(`Acesso restrito. Esta página é apenas para usuários com papel: ${requiredRole}.`);
          return;
        }

        // Verificar permissões se especificadas
        if (requiredPermissions.length > 0) {
          const hasRequiredPermissions = securityContext.hasAllPermissions(requiredPermissions);
          
          if (!hasRequiredPermissions) {
            setIsAuthorized(false);
            setErrorMessage('Você não possui as permissões necessárias para acessar esta página.');
            return;
          }
        }

        // Se chegou até aqui, usuário está autorizado
        setIsAuthorized(true);
        setErrorMessage('');

      } catch (error) {
        console.error('Erro ao verificar autorização:', error);
        setIsAuthorized(false);
        setErrorMessage('Erro interno. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredPermissions, requiredRole, location.pathname]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se não autorizado e não autenticado, redirecionar para login
  if (!isAuthorized && !authService.getSecurityContext().isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se não autorizado mas autenticado, mostrar acesso negado
  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : <AccessDenied message={errorMessage} />;
  }

  // Se autorizado, renderizar componente
  return <>{children}</>;
};

export default ProtectedRoute;

// Hook para usar proteção programática
export const useProtection = (
  requiredPermissions: Permission[] = [],
  requiredRole?: UserRole
) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const isValid = await authService.validateSession();
      if (!isValid) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      const context = authService.getSecurityContext();
      
      let authorized = context.isAuthenticated;
      
      if (requiredRole) {
        authorized = authorized && context.hasRole(requiredRole);
      }
      
      if (requiredPermissions.length > 0) {
        authorized = authorized && context.hasAllPermissions(requiredPermissions);
      }
      
      setIsAuthorized(authorized);
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredPermissions, requiredRole]);

  return { isAuthorized, isLoading };
};

// Componente para exibir conteúdo baseado em permissões
interface PermissionGateProps {
  children: React.ReactNode;
  permissions?: Permission[];
  role?: UserRole;
  fallback?: React.ReactNode;
  requireAll?: boolean; // Se true, requer todas as permissões; se false, requer apenas uma
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions = [],
  role,
  fallback = null,
  requireAll = true
}) => {
  const context = authService.getSecurityContext();
  
  if (!context.isAuthenticated) {
    return <>{fallback}</>;
  }

  // Verificar role
  if (role && !context.hasRole(role)) {
    return <>{fallback}</>;
  }

  // Verificar permissões
  if (permissions.length > 0) {
    const hasPermissions = requireAll 
      ? context.hasAllPermissions(permissions)
      : context.hasAnyPermission(permissions);
    
    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Componente para botões com proteção
interface ProtectedButtonProps {
  children: React.ReactNode;
  permissions?: Permission[];
  role?: UserRole;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  children,
  permissions = [],
  role,
  onClick,
  className = '',
  disabled = false,
  disabledMessage = 'Sem permissão'
}) => {
  const context = authService.getSecurityContext();
  
  const hasAccess = context.isAuthenticated &&
    (role ? context.hasRole(role) : true) &&
    (permissions.length > 0 ? context.hasAllPermissions(permissions) : true);

  const isDisabled = disabled || !hasAccess;
  
  const title = !hasAccess ? disabledMessage : undefined;

  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      disabled={isDisabled}
      title={title}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
