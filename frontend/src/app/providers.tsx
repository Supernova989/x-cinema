import type { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider
                defaultColorScheme="dark"
            >
                <ModalsProvider>
                    <Notifications />
                    {children}
                </ModalsProvider>

                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
            </MantineProvider>
        </QueryClientProvider>
    );
}