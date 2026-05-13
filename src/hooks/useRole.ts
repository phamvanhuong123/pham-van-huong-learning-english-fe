import { useAuthStore } from '@/modules/auth/store/useAuthStore';

export type Role = 'STANDARD' | 'VIP' | 'ADMIN';

/**
 * Custom hook for Role-Based Access Control (RBAC)
 */
export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role: Role = user?.role || 'STANDARD';

  return {
    role,
    user,
    
    // Basic role checks
    isStandard: role === 'STANDARD',
    isVIP: role === 'VIP',
    isAdmin: role === 'ADMIN',
    
    // Level-based checks
    isAtLeastVIP: role === 'VIP' || role === 'ADMIN',
    
    /**
     * Check if the current user has any of the required roles
     */
    hasRole: (roles: Role[]) => roles.includes(role),
  };
}
