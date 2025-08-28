import { authService, Permission } from '../services/authService';

// Interface para auditoria de ações
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// Interface para validação de ação
export interface ActionValidation {
  isAllowed: boolean;
  reason?: string;
  requiredPermissions?: Permission[];
}

// Classe para middleware de segurança
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private auditLogs: AuditLog[] = [];

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  // Validar ação antes de executar
  validateAction(
    action: string,
    resource: string,
    requiredPermissions: Permission[] = []
  ): ActionValidation {
    const context = authService.getSecurityContext();

    // Verificar se usuário está autenticado
    if (!context.isAuthenticated) {
      return {
        isAllowed: false,
        reason: 'Usuário não autenticado',
        requiredPermissions
      };
    }

    // Verificar sessão válida
    if (!authService.isSessionValid()) {
      return {
        isAllowed: false,
        reason: 'Sessão expirada',
        requiredPermissions
      };
    }

    // Verificar permissões específicas
    if (requiredPermissions.length > 0) {
      const hasPermissions = context.hasAllPermissions(requiredPermissions);
      
      if (!hasPermissions) {
        return {
          isAllowed: false,
          reason: 'Permissões insuficientes',
          requiredPermissions
        };
      }
    }

    // Verificar ações críticas (requerem confirmação adicional)
    if (this.isCriticalAction(action)) {
      const shouldAllow = this.validateCriticalAction(action, resource);
      if (!shouldAllow) {
        return {
          isAllowed: false,
          reason: 'Ação crítica negada por política de segurança',
          requiredPermissions
        };
      }
    }

    return { isAllowed: true };
  }

  // Executar ação com segurança
  async executeSecureAction<T>(
    action: string,
    resource: string,
    requiredPermissions: Permission[],
    actionFunction: () => Promise<T>,
    details?: any
  ): Promise<T> {
    const context = authService.getSecurityContext();
    const validation = this.validateAction(action, resource, requiredPermissions);

    // Log da tentativa de ação
    await this.logAction({
      userId: context.user?.id || 'unknown',
      userEmail: context.user?.email || 'unknown',
      action,
      resource,
      details,
      timestamp: new Date(),
      success: validation.isAllowed,
      errorMessage: validation.reason
    });

    // Se não permitido, lançar erro
    if (!validation.isAllowed) {
      throw new Error(`Ação não permitida: ${validation.reason}`);
    }

    try {
      // Executar ação
      const result = await actionFunction();

      // Log de sucesso
      await this.logAction({
        userId: context.user?.id || 'unknown',
        userEmail: context.user?.email || 'unknown',
        action: `${action}_completed`,
        resource,
        details: { ...details, result: 'success' },
        timestamp: new Date(),
        success: true
      });

      return result;

    } catch (error: any) {
      // Log de erro
      await this.logAction({
        userId: context.user?.id || 'unknown',
        userEmail: context.user?.email || 'unknown',
        action: `${action}_failed`,
        resource,
        details: { ...details, error: error.message },
        timestamp: new Date(),
        success: false,
        errorMessage: error.message
      });

      throw error;
    }
  }

  // Verificar se é ação crítica
  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'delete_user',
      'delete_visitor',
      'mass_delete',
      'backup_restore',
      'change_permissions',
      'delete_all_data',
      'export_sensitive_data',
      'change_admin_settings'
    ];

    return criticalActions.some(critical => 
      action.toLowerCase().includes(critical.toLowerCase())
    );
  }

  // Validar ação crítica
  private validateCriticalAction(action: string, resource: string): boolean {
    const context = authService.getSecurityContext();

    // Apenas admins podem executar ações críticas
    if (!context.hasRole('admin')) {
      return false;
    }

    // Verificar se não é horário de manutenção ou fora do expediente
    if (this.isMaintenanceTime()) {
      return false;
    }

    // Verificar limite de ações críticas por período
    if (this.exceedsCriticalActionLimit(context.user?.id || '')) {
      return false;
    }

    return true;
  }

  // Verificar se é horário de manutenção
  private isMaintenanceTime(): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    // Bloquear ações críticas entre 22h e 6h
    return hour >= 22 || hour <= 6;
  }

  // Verificar limite de ações críticas
  private exceedsCriticalActionLimit(userId: string): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentCriticalActions = this.auditLogs.filter(log => 
      log.userId === userId &&
      log.timestamp > oneHourAgo &&
      this.isCriticalAction(log.action) &&
      log.success
    );

    // Máximo 5 ações críticas por hora
    return recentCriticalActions.length >= 5;
  }

  // Registrar log de auditoria
  private async logAction(logData: Omit<AuditLog, 'id' | 'ipAddress' | 'userAgent'>): Promise<void> {
    try {
      // Obter informações adicionais do navegador
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      const auditLog: AuditLog = {
        id: this.generateLogId(),
        ...logData,
        ipAddress,
        userAgent
      };

      // Armazenar log localmente (em produção, enviar para servidor)
      this.auditLogs.push(auditLog);

      // Manter apenas últimos 1000 logs na memória
      if (this.auditLogs.length > 1000) {
        this.auditLogs = this.auditLogs.slice(-1000);
      }

      // TODO: Enviar para banco de dados em produção
      console.log('Audit Log:', auditLog);

    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  // Obter IP do cliente (simplificado)
  private async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      return 'localhost';
    } catch {
      return 'unknown';
    }
  }

  // Gerar ID único para log
  private generateLogId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Obter logs de auditoria
  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      
      if (filters.action) {
        logs = logs.filter(log => 
          log.action.toLowerCase().includes(filters.action!.toLowerCase())
        );
      }
      
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      
      if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Limpar logs antigos
  clearOldLogs(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
  }

  // Verificar atividade suspeita
  detectSuspiciousActivity(userId: string): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const userLogs = this.auditLogs.filter(log => 
      log.userId === userId && log.timestamp > oneHourAgo
    );

    const reasons: string[] = [];

    // Muitas tentativas de login falhadas
    const failedLogins = userLogs.filter(log => 
      log.action === 'login' && !log.success
    ).length;
    
    if (failedLogins >= 5) {
      reasons.push('Múltiplas tentativas de login falhadas');
    }

    // Muitas ações em pouco tempo
    if (userLogs.length >= 100) {
      reasons.push('Volume excessivo de ações');
    }

    // Tentativas de acesso a recursos não autorizados
    const unauthorizedAttempts = userLogs.filter(log => 
      !log.success && log.errorMessage?.includes('Permissões insuficientes')
    ).length;
    
    if (unauthorizedAttempts >= 10) {
      reasons.push('Múltiplas tentativas de acesso não autorizado');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }

  // Bloquear usuário por atividade suspeita
  async blockSuspiciousUser(userId: string, reason: string): Promise<void> {
    await this.logAction({
      userId: 'system',
      userEmail: 'system',
      action: 'block_user',
      resource: 'user_management',
      details: { blockedUserId: userId, reason },
      timestamp: new Date(),
      success: true
    });

    // TODO: Implementar bloqueio real no banco de dados
    console.warn(`Usuário ${userId} bloqueado por: ${reason}`);
  }
}

// Instância global do middleware
export const securityMiddleware = SecurityMiddleware.getInstance();

// Decorador para métodos seguros
export function SecureAction(
  action: string,
  resource: string,
  permissions: Permission[] = []
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return await securityMiddleware.executeSecureAction(
        action,
        resource,
        permissions,
        () => method.apply(this, args)
      );
    };
  };
}
