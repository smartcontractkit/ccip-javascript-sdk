'use client';

import '@chainlink/ccip-react-components/dist/style.css';
import { CCIPWidget } from '@chainlink/ccip-react-components';

import { config } from '@/config';
import { networkConfig } from '@/config/networkConfig';

export function DefaultWidget() {
  return <CCIPWidget config={config} networkConfig={networkConfig} />;
}
