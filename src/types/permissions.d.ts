/**
 * Configuration for permission-based visibility checks
 * Supports both OR logic (anyOf) and AND logic (allOf)
 */
type PermissionConfig = {
  /**
   * OR logic: user needs ANY of these permissions
   * @example { anyOf: ['materials:view', 'materials:manage'] }
   */
  anyOf?: string[];

  /**
   * AND logic: user needs ALL of these permissions
   * @example { allOf: ['reports:view', 'reports:export'] }
   */
  allOf?: string[];
};

/**
 * Props for permission-protected components
 */
interface PermissionGuardProps {
  /** Child components to render if permission check passes */
  children: React.ReactNode;

  /** Permission requirement - can be string, array, or config object */
  permissions?: string | string[] | PermissionConfig;

  /** Component to render if permission check fails */
  fallback?: React.ReactNode;

  /** If true, show children for all authenticated users regardless of permissions */
  allowAll?: boolean;
}
