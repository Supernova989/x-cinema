import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/me';
export const CURRENT_USER_QUERY_KEY = ['current-user'];

export function useCurrentUser() {
    return useQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: getCurrentUser,

        // The current user rarely changes.
        staleTime: 5 * 60 * 1000,

        // Keep it cached while the app is open.
        gcTime: Infinity,

        // Don't retry if we're unauthorized.
        retry: false,
    });
}