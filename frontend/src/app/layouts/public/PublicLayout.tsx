import * as React from 'react';
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router';
import { Footer } from '@/app/layouts/public/Footer.tsx';
import { Header } from '@/app/layouts/public/Header.tsx';

export const PublicLayout: React.FC = () => {
  return (
    <AppShell header={{ height: 64 }} footer={{ height: 80 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
};
