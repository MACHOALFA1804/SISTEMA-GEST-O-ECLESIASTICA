import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Tipos de permissões no sistema
export type Permission = 
  | 'view_visitors'
  | 'create_visitors'
  | 'edit_visitors'
  | 'delete_visitors'
  | 'view_visits'
  | 'create_visits'
  | 'edit_visits'
  | 'delete_visits'
  | 'send_messages'
  | 'view_messages'
  | 'generate_reports'
  | 'manage_users'
  | 'manage_settings'
  | 'manage_whatsapp'
  | 'manage_backup'
  | 'view_analytics'
  | 'access_admin'
  | 'access_pastor'
  | 'access_reception'
  | 'access_dizimista';

// Funções/roles no sistema
export type UserRole = 'admin' | 'pastor' | 'recepcionista' | 'dizimista';

// Interface para usuário com permissões
export interface UserWithPermissions {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Configuração de permissões por função
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Todas as permissões
    'view_visitors',
    'create_visitors',
    'edit_visitors',
    'delete_visitors',
    'view_visits',
    'create_visits',
    'edit_visits',
    'delete_visits',
    'send_messages',
    'view_messages',
    'generate_reports',
    'manage_users',
    'manage_settings',
    'manage_whatsapp',
    'manage_backup',
    'view_analytics',
    'access_admin',
    'access_pastor',
    'access_reception'
  ],
  
  pastor: [
    // Permissões pastorais
    'view_visitors',
    'create_visitors',
    'edit_visitors',
    'view_visits',
    'create_visits',
    'edit_visits',
    'send_messages',
    'view_messages',
    'generate_reports',
    'view_analytics',
    'access_pastor',
    'access_reception'
  ],
  
  recepcionista: [
    // Permissões básicas de recepção
    'view_visitors',
    'create_visitors',
    'edit_visitors',
    'view_visits',
    'access_reception'
  ],
  
  dizimista: [
    // Permissões de dizimista
    'access_dizimista'
  ]
};

// Interface para contexto de segurança
export interface SecurityContext {
  user: UserWithPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  role: UserRole | null;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccess: (resource: string) => boolean;
}

// Classe para gerenciar autenticação e autorização
export class AuthService {
  private static instance: AuthService;
  private currentUser: UserWithPermissions | null = null;
  private sessionExpiry: Date | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Fazer login e carregar permissões
  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: UserWithPermissions;
    error?: string;
  }> {
    try {
      // Verificar se é o usuário dizimista hardcoded
      if (email === 'dizimistas@igreja.com' && password === '123456') {
        const dizimistaUser: UserWithPermissions = {
          id: 'dizimista-hardcoded',
          email: 'dizimistas@igreja.com',
          role: 'dizimista',
          permissions: ROLE_PERMISSIONS['dizimista'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Definir expiração da sessão (8 horas)
        this.sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
        this.currentUser = dizimistaUser;

        // Registrar login no log de auditoria
        await this.logUserAction('login', dizimistaUser.id);

        return {
          success: true,
          user: dizimistaUser
        };
      }

      // Fazer login no Supabase para outros usuários
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Erro no login'
        };
      }

      // Carregar dados do usuário com permissões
      const userWithPermissions = await this.loadUserPermissions(authData.user.id);
      
      if (!userWithPermissions) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Usuário não encontrado ou sem permissões'
        };
      }

      // Verificar se usuário está ativo
      if (!userWithPermissions.isActive) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Usuário desativado. Contate o administrador.'
        };
      }

      // Atualizar último login
      await this.updateLastLogin(userWithPermissions.id);

      // Definir expiração da sessão (8 horas)
      this.sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
      this.currentUser = userWithPermissions;

      // Registrar login no log de auditoria
      await this.logUserAction('login', userWithPermissions.id);

      return {
        success: true,
        user: userWithPermissions
      };

    } catch (error: any) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: 'Erro interno no sistema'
      };
    }
  }

  // Fazer logout
  async logout(): Promise<void> {
    try {
      if (this.currentUser) {
        await this.logUserAction('logout', this.currentUser.id);
      }
      
      await supabase.auth.signOut();
      this.currentUser = null;
      this.sessionExpiry = null;
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  // Verificar se sessão é válida
  isSessionValid(): boolean {
    if (!this.sessionExpiry || !this.currentUser) {
      return false;
    }
    
    return new Date() < this.sessionExpiry;
  }

  // Renovar sessão
  async renewSession(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session && this.currentUser) {
        this.sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      return false;
    }
  }

  // Carregar permissões do usuário
  private async loadUserPermissions(userId: string): Promise<UserWithPermissions | null> {
    try {
      // Buscar perfil do usuário na tabela profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, nome, email, ativo')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return null;
      }

      if (!profile) {
        console.error('Perfil não encontrado para o usuário:', userId);
        return null;
      }

      // Verificar se o usuário está ativo
      if (!profile.ativo) {
        console.error('Usuário desativado:', userId);
        return null;
      }

      // Mapear o role para o tipo correto
      let role: UserRole;
      switch (profile.role) {
        case 'admin':
          role = 'admin';
          break;
        case 'pastor':
          role = 'pastor';
          break;
        case 'recepcionista':
          role = 'recepcionista';
          break;
        case 'dizimista':
          role = 'dizimista';
          break;
        default:
          console.error('Role não reconhecido:', profile.role);
          return null;
      }

      const userWithPermissions: UserWithPermissions = {
        id: userId,
        email: profile.email || '',
        role,
        permissions: ROLE_PERMISSIONS[role],
        isActive: profile.ativo,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return userWithPermissions;

    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      return null;
    }
  }

  // Atualizar último login
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      // TODO: Implementar quando tabela de usuários estiver criada
      console.log(`Último login atualizado para usuário: ${userId}`);
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  // Registrar ação do usuário para auditoria
  private async logUserAction(action: string, userId: string, details?: any): Promise<void> {
    try {
      // TODO: Implementar log de auditoria
      console.log(`Log de auditoria: ${action} por ${userId}`, details);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }

  // Obter usuário atual
  getCurrentUser(): UserWithPermissions | null {
    return this.currentUser;
  }

  // Verificar permissão específica
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser || !this.isSessionValid()) {
      return false;
    }
    
    return this.currentUser.permissions.includes(permission);
  }

  // Verificar role
  hasRole(role: UserRole): boolean {
    if (!this.currentUser || !this.isSessionValid()) {
      return false;
    }
    
    return this.currentUser.role === role;
  }

  // Verificar múltiplas permissões (qualquer uma)
  hasAnyPermission(permissions: Permission[]): boolean {
    if (!this.currentUser || !this.isSessionValid()) {
      return false;
    }
    
    return permissions.some(permission => 
      this.currentUser!.permissions.includes(permission)
    );
  }

  // Verificar múltiplas permissões (todas)
  hasAllPermissions(permissions: Permission[]): boolean {
    if (!this.currentUser || !this.isSessionValid()) {
      return false;
    }
    
    return permissions.every(permission => 
      this.currentUser!.permissions.includes(permission)
    );
  }

  // Verificar acesso a recurso
  canAccess(resource: string): boolean {
    const resourcePermissions: Record<string, Permission[]> = {
      'reception': ['access_reception'],
      'pastor': ['access_pastor'],
      'admin': ['access_admin'],
      'dizimista': ['access_dizimista'],
      'visitors': ['view_visitors'],
      'visits': ['view_visits'],
      'messages': ['view_messages'],
      'reports': ['generate_reports'],
      'settings': ['manage_settings'],
      'users': ['manage_users'],
      'whatsapp': ['manage_whatsapp'],
      'backup': ['manage_backup']
    };

    const requiredPermissions = resourcePermissions[resource];
    if (!requiredPermissions) {
      return false;
    }

    return this.hasAnyPermission(requiredPermissions);
  }

  // Obter contexto de segurança completo
  getSecurityContext(): SecurityContext {
    const user = this.getCurrentUser();
    const isAuthenticated = user !== null && this.isSessionValid();

    return {
      user,
      isAuthenticated,
      isLoading: false,
      permissions: user?.permissions || [],
      role: user?.role || null,
      hasPermission: this.hasPermission.bind(this),
      hasRole: this.hasRole.bind(this),
      hasAnyPermission: this.hasAnyPermission.bind(this),
      hasAllPermissions: this.hasAllPermissions.bind(this),
      canAccess: this.canAccess.bind(this)
    };
  }

  // Validar token e sessão
  async validateSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        this.currentUser = null;
        this.sessionExpiry = null;
        return false;
      }

      // Se não temos usuário carregado, carregar
      if (!this.currentUser) {
        const userWithPermissions = await this.loadUserPermissions(session.user.id);
        if (userWithPermissions) {
          this.currentUser = userWithPermissions;
          this.sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
        }
      }

      return this.isSessionValid();

    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }

  // Força logout por expiração ou mudança de permissões
  async forceLogout(reason: string = 'Sessão expirada'): Promise<void> {
    try {
      if (this.currentUser) {
        await this.logUserAction('forced_logout', this.currentUser.id, { reason });
      }
      
      await this.logout();
      
      // Notificar usuário
      if (typeof window !== 'undefined') {
        alert(`Você foi desconectado: ${reason}`);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erro no logout forçado:', error);
    }
  }
}

// Instância global do serviço de autenticação
export const authService = AuthService.getInstance();

// Hook para usar autenticação no React
export const useAuth = (): SecurityContext => {
  return authService.getSecurityContext();
};
