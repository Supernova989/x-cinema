import type { ReactNode } from 'react';

import { Navigate } from 'react-router';
import { Center, Loader } from '@mantine/core';

import { useCurrentUser } from '@/auth/hooks/useCurrentUser';

type ProtectedRouteProps = {
    children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const {
        data: user,
        isPending,
        isError,
    } = useCurrentUser();

    if (isPending) {
        return (
            <Center h="100vh">
                <Loader />
            </Center>
        );
    }

    if (isError || !user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}