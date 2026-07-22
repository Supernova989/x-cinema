import * as React from 'react';
import { AppShell } from '@mantine/core';
import { Header } from './Header.tsx';
import { Outlet } from 'react-router';
import { Footer } from './Footer.tsx';

export const AccountLayout: React.FC = () => {
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
