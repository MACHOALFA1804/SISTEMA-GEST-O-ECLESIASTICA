// Arquivo de compatibilidade para manter imports existentes
// Re-exporta tudo do supabaseClient.ts

export * from './supabaseClient';

// Re-exportação explícita dos principais exports para garantia
export { 
  supabase, 
  supabaseTyped,
  type Database,
  type VisitanteRow,
  type ProfileRow,
  type VisitaRow,
  type MensagemRow,
  type ConfiguracaoRow,
  type DizimistaRow,
  type ContribuicaoRow,
  type MetaArrecadacaoRow,
  type PermissoesUsuario,
  type UsuarioSistemaRow,
  type LogAdminRow,
  type TextoPersonalizadoRow,
  type TemplateEmailRow,
  type LogotipoRow,
  type NichoMinisterioRow,
  type RelatorioGeralRow,
  type AuditoriaRow,
  type NotificacaoRow,
  type BackupRow,
  isValidStatus,
  isValidRole,
  isValidTipoContribuicao,
  TIPOS_VISITANTE,
  STATUS_VISITANTE,
  ROLES_USUARIO,
  TIPOS_CONTRIBUICAO,
  FORMAS_PAGAMENTO
} from './supabaseClient';