'use client';

import '@chainlink/ccip-react-components/dist/style.css';
import { TDrawer, CCIPWidget } from '@chainlink/ccip-react-components';

import { useRef } from 'react';
import { config } from '@/config';
import { networkConfig } from '@/config/networkConfig';

export function DrawerWidget() {
  const drawerRef = useRef<TDrawer>(null);

  const toggleWidget = () => {
    drawerRef.current?.toggleDrawer();
  };
  return (
    <>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={toggleWidget}
      >
        Open Drawer
      </button>
      <CCIPWidget
        config={{ ...config, variant: 'drawer' }}
        networkConfig={networkConfig}
        ref={drawerRef}
      />
    </>
  );
}
