'use client';

import { forwardRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Default } from '@/AppDefault';
import { Providers } from '@/AppProviders';
import { Drawer } from '@/components/Drawer';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils';
import { ConfigProps, TDrawer } from '@/types';

export const App = forwardRef<TDrawer, ConfigProps>(
  ({ config, drawer, networkConfig }, ref) => {
    if (config?.variant === 'drawer') {
      return (
        <Providers config={config} networkConfig={networkConfig}>
          <Drawer open={drawer?.open} ref={ref}>
            <Container>
              <Default />
            </Container>
          </Drawer>
        </Providers>
      );
    }

    return (
      <Providers config={config} networkConfig={networkConfig}>
        <Container>
          <Default />
        </Container>
      </Providers>
    );
  }
);

const Container = ({ children }: { children: React.ReactNode }) => {
  const { style, variant } = useTheme();

  return (
    <Card
      className={cn(
        'w-screen bg-ccip-background text-ccip-text h-screen md:h-auto md:min-h-[640px]',
        variant === 'compact' ? 'md:w-[375px]' : 'md:w-[473px]',
        variant === 'drawer'
          ? 'border-none shadow-none md:w-[471px]'
          : 'border-ccip-border'
      )}
      style={style}
    >
      {children}
    </Card>
  );
};
