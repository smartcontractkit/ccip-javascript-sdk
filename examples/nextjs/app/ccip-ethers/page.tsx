"use client";

import { useMemo, useState } from "react";
import { Providers } from "../ccip-js/providers";
import { ethers } from "ethers";
import { createClient } from "@chainlink/ccip-js";
import { useAccount, useSwitchChain } from "wagmi";
// Import adapters via compiled dist path to avoid missing type exports in older versions.
// Runtime will work since the package ships these files.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ethersProviderToPublicClient, ethersSignerToWalletClient } from "@chainlink/ccip-js/dist/ethers-adapters.js";

export default function CCIPEthersDemoPage() {
  return (
    <Providers>
      <EthersDemo />
    </Providers>
  );
}

function EthersDemo() {
  const ccipClient = useMemo(() => createClient(), []);
  const [publicReady, setPublicReady] = useState(false);
  const [walletReady, setWalletReady] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const { chain, address } = useAccount();
  const { chains, switchChain, isError: isSwitchError, error: switchError } = useSwitchChain();
  const [selectedChainId, setSelectedChainId] = useState<string>("");

  const [routerAddress, setRouterAddress] = useState<string>("");
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>("");
  const [onRamp, setOnRamp] = useState<string>("");
  const [onRampError, setOnRampError] = useState<string | null>(null);

  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setWalletClient] = useState<any>(null);

  async function connectEthers() {
    try {
      setPublicError(null);
      setWalletError(null);
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await browserProvider.getSigner();

      const net = await browserProvider.getNetwork();
      const viemChain = {
        id: Number(net.chainId),
        name: net.name || "unknown",
        nativeCurrency: { name: "", symbol: "", decimals: 18 },
        rpcUrls: { default: { http: [] }, public: { http: [] } },
      } as any;

      const viemPublic = ethersProviderToPublicClient(browserProvider, viemChain);
      const viemWallet = await ethersSignerToWalletClient(signer, viemChain);

      setPublicClient(viemPublic);
      setWalletClient(viemWallet);
      setPublicReady(true);
      setWalletReady(true);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      if (!publicReady) setPublicError(msg);
      if (!walletReady) setWalletError(msg);
    }
  }

  return (
    <div className="m-2 p-2 w-full grid gap-2">
      <div className="space-y-2 border rounded-md p-4 bg-white">
        <h2 className="font-bold">Connect (ethers → viem via adapters)</h2>
        <button
          className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
          onClick={connectEthers}
        >
          Connect
        </button>
        {!publicReady && publicError && <p className="text-red-500">{publicError}</p>}
        {!walletReady && walletError && <p className="text-red-500">{walletError}</p>}
        {publicReady && walletReady && <p>Adapters ready.</p>}
      </div>

      <div className="space-y-2 border rounded-md p-4 bg-white">
        <h2 className="font-bold">Network</h2>
        {address && <p>{`Address: ${address}`}</p>}
        {chain && <p>{`Connected to ${chain.name} (chainId: ${chain.id})`}</p>}
        <div className="flex flex-col">
          <label htmlFor="chainId">Switch to chain</label>
          <select
            className="border border-slate-300 rounded-md p-1"
            name="chainId"
            value={selectedChainId}
            onChange={e => setSelectedChainId(e.target.value)}
          >
            <option value="" disabled>
              Select chain
            </option>
            {chains.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
          onClick={async () => {
            if (selectedChainId) {
              try {
                await switchChain({ chainId: Number(selectedChainId) });
                await connectEthers();
              } catch (e) {
                // ignore, error shown below
              }
            }
          }}
        >
          Switch
        </button>
        {isSwitchError && <p className="text-red-500">{switchError?.message}</p>}
      </div>

      <div className="space-y-2 border rounded-md p-4 bg-white">
        <h2 className="font-bold">Get On-ramp address (ethers-adapted public client)</h2>
        <div className="flex flex-col">
          <label htmlFor="routerAddress">Router Address*</label>
          <input
            className="border border-slate-300 rounded-md p-1"
            name="routerAddress"
            placeholder="0x..."
            onChange={({ target }) => setRouterAddress(target.value)}
          />
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="destinationChainSelector">Destination Chain Selector*</label>
          <input
            className="border border-slate-300 rounded-md p-1"
            name="destinationChainSelector"
            placeholder="1234..."
            onChange={({ target }) => setDestinationChainSelector(target.value)}
          />
        </div>
        <button
          className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
          onClick={async () => {
            setOnRamp("");
            setOnRampError(null);
            if (publicClient && routerAddress && destinationChainSelector) {
              try {
                const result = await ccipClient.getOnRampAddress({
                  client: publicClient,
                  routerAddress: routerAddress as any,
                  destinationChainSelector,
                });
                setOnRamp(result as string);
              } catch (e: any) {
                setOnRampError(e?.message ?? String(e));
              }
            }
          }}
        >
          Get On-ramp
        </button>
        {onRampError && <p className="text-red-500">{onRampError}</p>}
        {onRamp && (
          <div className="flex flex-col w-full">
            <label>On-ramp contract address:</label>
            <code className="w-full whitespace-pre-wrap break-all">{onRamp}</code>
          </div>
        )}
      </div>
    </div>
  );
}


