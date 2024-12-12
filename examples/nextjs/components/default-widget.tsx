'use client';

import '@chainlink/ccip-react-components/dist/style.css';
import { CCIPWidget } from '@chainlink/ccip-react-components';

import { tokensList } from '@/config/tokensList';
import { config } from '@/config';

export function DefaultWidget() {
  return <CCIPWidget config={config} tokensList={tokensList} />;
}
