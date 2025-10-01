"use client";

import { createClient, IERC20ABI, RateLimiterState, TransferStatus } from "@chainlink/ccip-js";
import { useConnect, useAccount, useSwitchChain, usePublicClient, useWalletClient } from "wagmi";
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  Hash,
  Hex,
  parseEther,
  PublicClient,
  TransactionReceipt,
  WalletClient,
} from "viem";
import { custom, createPublicClient, createWalletClient } from "viem";
import { toAccount } from "viem/accounts";
import { useEffect, useMemo, useState } from "react";
import { wagmiConfig } from "@/config/wagmiConfig";

const ccipClient = createClient();

function logAction(providerType: "wagmi" | "ethers", action: string, details?: Record<string, unknown>) {
  const meta = details ? ` ${JSON.stringify(details)}` : "";
  console.info(`[CCIP Example] ${action} provider=${providerType}${meta}`);
}

async function buildViemClientsFromInjected(
  requestAccounts: boolean,
): Promise<
  | {
      pub: PublicClient;
      wal: WalletClient;
      address: string;
      chainId: number;
      chainName: string;
    }
  | null
> {
  const anyWindow: any = window as any;
  if (!anyWindow?.ethereum) return null;

  const ethersMod: any = await import("ethers");
  const BrowserProvider = ethersMod.BrowserProvider;
  const browserProvider = new BrowserProvider(anyWindow.ethereum);
  if (requestAccounts) {
    await anyWindow.ethereum.request({ method: "eth_requestAccounts" });
  }
  const signer: any = await browserProvider.getSigner();
  const addr = await signer.getAddress();
  const network = await browserProvider.getNetwork();
  const cid = Number(network.chainId);
  const viemChain = wagmiConfig.chains.find(c => c.id === cid);
  if (!viemChain) return null;
  const transport = custom({
    async request({ method, params }) {
      return (browserProvider as any).send(method, params as any);
    },
  });
  const pub = createPublicClient({ chain: viemChain as any, transport }) as unknown as PublicClient;
  const account = await toAccount({
    address: addr as any,
    async signMessage({ message }) {
      const data = typeof message === 'string' ? message : new TextDecoder().decode(message as any);
      return signer.signMessage(data) as unknown as Hash;
    },
    async signTransaction(txn) {
      return signer.signTransaction({
        chainId: txn.chainId,
        data: txn.data,
        gasLimit: txn.gas,
        gasPrice: txn.gasPrice,
        nonce: txn.nonce,
        to: txn.to,
        value: txn.value,
        type: txn.type === 'legacy' ? 0 : txn.type === 'eip2930' ? 1 : txn.type === 'eip1559' ? 2 : undefined,
        ...(txn.type && txn.accessList ? { accessList: txn.accessList } : {}),
        ...(txn.maxPriorityFeePerGas ? { maxPriorityFeePerGas: txn.maxPriorityFeePerGas } : {}),
        ...(txn.maxFeePerGas ? { maxFeePerGas: txn.maxFeePerGas } : {}),
      } as any) as unknown as Hash;
    },
    async signTypedData({ domain, types, message }) {
      const { EIP712Domain: _removed, ...rest } = types as any;
      const signTypedData = signer._signTypedData ?? signer.signTypedData;
      return signTypedData(domain ?? {}, rest as Record<string, any[]>, message) as unknown as Hash;
    },
  });
  const wal = createWalletClient({ chain: viemChain as any, transport, account }) as unknown as WalletClient;
  return { pub, wal, address: addr, chainId: cid, chainName: viemChain.name };
}

export function CCIP() {
  const wagmiPublicClient = usePublicClient();
  const { data: wagmiWalletClient } = useWalletClient();

  const [providerType, setProviderType] = useState<"wagmi" | "ethers">("wagmi");
  const [ethersPublicClient, setEthersPublicClient] = useState<PublicClient | null>(null);
  const [ethersWalletClient, setEthersWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    async function ensureEthersClients() {
      if (providerType !== "ethers") return;
      if (ethersPublicClient && ethersWalletClient) return;
      try {
        const built = await buildViemClientsFromInjected(false);
        if (!built) return;
        setEthersPublicClient(built.pub);
        setEthersWalletClient(built.wal);
      } catch {
        // noop: user may not have injected provider
      }
    }
    void ensureEthersClients();
  }, [providerType, ethersPublicClient, ethersWalletClient]);

  // No-op mirror; ConnectWallet manages ethers client creation

  const selectedPublicClient = useMemo(() => {
    if (providerType === "ethers") return ethersPublicClient ?? wagmiPublicClient;
    return wagmiPublicClient;
  }, [providerType, wagmiPublicClient, ethersPublicClient]);

  const selectedWalletClient = useMemo(() => {
    if (providerType === "ethers") return ethersWalletClient ?? wagmiWalletClient ?? undefined;
    return wagmiWalletClient ?? undefined;
  }, [providerType, wagmiWalletClient, ethersWalletClient]);

  return (
    <div className="m-2 p-2 w-full grid md:grid-cols-2 gap-2">
      <ConnectWallet
        key={`connect-${providerType}`}
        providerType={providerType}
        onProviderTypeChange={setProviderType}
        setEthersClients={(pub, wal) => {
          setEthersPublicClient(pub);
          setEthersWalletClient(wal);
        }}
      />
      {selectedPublicClient && (
        <>
          <GetAllowance key={`allow-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetOnRampAddress key={`onramp-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetSupportedFeeTokens key={`feeTokens-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetLaneRateRefillLimits key={`laneRefill-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <IsTokenSupported key={`tokenSupported-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetTokenRateLimitByLane key={`tokenRate-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetTokenAdminRegistry key={`admin-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetTransactionReceipt key={`txrcpt-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
          <GetTransferStatus key={`status-${providerType}`} providerType={providerType} />
          <GetFee key={`fee-${providerType}`} providerType={providerType} publicClient={selectedPublicClient} />
        </>
      )}
      {selectedWalletClient && (
        <>
          <ApproveRouter key={`approve-${providerType}`} providerType={providerType} walletClient={selectedWalletClient} />
          <TransferTokensAndMessage key={`transfer-${providerType}`} providerType={providerType} walletClient={selectedWalletClient} />
          <SendCCIPMessage key={`sendmsg-${providerType}`} providerType={providerType} walletClient={selectedWalletClient} />
          <SendFunctionData key={`sendfunc-${providerType}`} providerType={providerType} walletClient={selectedWalletClient} />
        </>
      )}
    </div>
  );
}

function ConnectWallet({
  providerType,
  onProviderTypeChange,
  setEthersClients,
}: {
  providerType: "wagmi" | "ethers";
  onProviderTypeChange: (p: "wagmi" | "ethers") => void;
  setEthersClients: (pub: PublicClient, wal: WalletClient) => void;
}) {
  const { chain, address } = useAccount();
  const { connectors, connect, isError: isConnectError, error: connectError } = useConnect();
  const { switchChain, error: switchError, isError: isSwitchError } = useSwitchChain();

  const [chainId, setChainId] = useState<string>(`${chain?.id}`);

  const [ethersAddress, setEthersAddress] = useState<string>();
  const [ethersChainId, setEthersChainId] = useState<number>();
  const [ethersChainName, setEthersChainName] = useState<string>();
  const [isEthersError, setIsEthersError] = useState<string | null>(null);

  useEffect(() => {
    if (providerType === "wagmi" && chain) {
      setChainId(`${chain.id}`);
    }
  }, [providerType, chain]);

  async function connectWithEthers() {
    try {
      setIsEthersError(null);
      const anyWindow: any = window as any;
      if (!anyWindow.ethereum) {
        throw new Error("No injected provider found");
      }
      const built = await buildViemClientsFromInjected(true);
      if (!built) {
        throw new Error("Connected to unsupported or missing chain");
      }
      setEthersAddress(built.address);
      setEthersChainId(built.chainId);
      setEthersChainName(built.chainName);
      setEthersClients(built.pub, built.wal);
    } catch (e: any) {
      setIsEthersError(e.message ?? String(e));
    }
  }

  async function switchEthersChain(targetId: number) {
    try {
      const anyWindow: any = window as any;
      await anyWindow.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + targetId.toString(16) }],
      });
      await connectWithEthers();
    } catch (e: any) {
      setIsEthersError(e.message ?? String(e));
    }
  }

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Connect Wallet:</h2>
      <p className="text-sm text-slate-600">Provider in use: {providerType === "wagmi" ? "WAGMI (viem)" : "Ethers.js (via viem adapters)"}</p>
      <div className="flex flex-col">
        <label htmlFor="provider">Provider</label>
        <select
          className="border border-slate-300 rounded-md p-1"
          name="provider"
          value={providerType}
          onChange={e => onProviderTypeChange(e.target.value as any)}
        >
          <option value="wagmi">WAGMI</option>
          <option value="ethers">Ethers.js</option>
        </select>
      </div>

      {/* Always show WAGMI connectors so wallet options remain visible */}
      <div className="space-x-2">
        {connectors.map(connector => (
          <button
            className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
            key={connector.uid}
            onClick={() => connect({ connector })}
          >
            {connector.name}
          </button>
        ))}
      </div>
      {isConnectError && <p className="text-red-500">{connectError.message}</p>}
      {isEthersError && providerType === "ethers" && <p className="text-red-500">{isEthersError}</p>}

      {/* Address line always visible if connected */}
      {(() => {
        const addr = ethersAddress || address;
        return addr ? <p>{`Address: ${addr}`}</p> : null;
      })()}

      {/* Connected chain line (when known) */}
      {(() => {
        const currentName = ethersChainName || chain?.name;
        const currentId = ethersChainId || chain?.id;
        return currentId ? <p>{`Connected to ${currentName} (chainId: ${currentId})`}</p> : null;
      })()}

      {/* Chain switcher always visible */}
      <div className="flex flex-col">
        <label htmlFor="switchChain">Switch to chain</label>
        <select
          className="border border-slate-300 rounded-md p-1"
          name="switchChain"
          value={String(Number(ethersChainId ?? chainId ?? chain?.id ?? wagmiConfig.chains[0].id))}
          onChange={e => {
            const id = Number(e.target.value);
            setChainId(String(id));
            setEthersChainId(id);
          }}
        >
          {(wagmiConfig.chains).map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={() => {
          if (providerType === "wagmi") {
            const id = Number(chainId || chain?.id || wagmiConfig.chains[0].id);
            switchChain({ chainId: id });
          } else {
            const resolved = ethersChainId ?? Number(chainId);
            const id = typeof resolved === 'number' && !Number.isNaN(resolved) ? resolved : wagmiConfig.chains[0].id;
            switchEthersChain(Number(id));
          }
        }}
      >
        Switch
      </button>
      {isSwitchError && <p className="text-red-500">{switchError.message}</p>}
    </div>
  );
}

function ApproveRouter({ walletClient, providerType }: { walletClient: WalletClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Approve Transfer</h2>
      <div className="flex flex-col">
        <label htmlFor="routerAddress">Router Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="routerAddress"
          placeholder="0x..."
          onChange={({ target }) => setRouterAddress(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
        />
      </div>
      <div className="flex flex-col w-full">
        <label htmlFor="amount">Amount*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="amount"
          type="number"
          step={10 / 10 ** 6}
          min={0}
          placeholder="0.1"
          onChange={({ target }) => setAmount(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && amount && tokenAddress) {
            logAction(providerType, 'ApproveRouter.click', { routerAddress, tokenAddress, amount });
            const result = await ccipClient.approveRouter({
              client: walletClient,
              routerAddress: routerAddress as Address,
              amount: parseEther(amount),
              tokenAddress: tokenAddress as Address,
            });
            setTxHash(result.txHash);
          }
        }}
      >
        Approve
      </button>
      {txHash && (
        <div className="flex flex-col w-full">
          <label>TxHash:</label>
          <code className="w-full whitespace-pre-wrap break-all">{txHash}</code>
        </div>
      )}
    </div>
  );
}

function TransferTokensAndMessage({ walletClient, providerType }: { walletClient: WalletClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [destinationAccount, setDestinationAccount] = useState<string>();
  const [data, setData] = useState<Hex>();
  const [messageId, setMessageId] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Transfer Tokens</h2>
      <div className="flex flex-col">
        <label htmlFor="routerAddress">Router Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="routerAddress"
          placeholder="0x..."
          onChange={({ target }) => setRouterAddress(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
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
      <div className="flex flex-col">
        <label htmlFor="destinationAccount">Destination Account*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="destinationAccount"
          placeholder="0x..."
          onChange={({ target }) => setDestinationAccount(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="message">Message</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="message"
          placeholder="0x..."
          onChange={({ target }) => setData(encodeAbiParameters([{ type: "string", name: "data" }], [target.value]))}
        />
      </div>
      <div className="flex flex-col w-full">
        <label htmlFor="amount">Amount*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="amount"
          type="number"
          step={10 / 10 ** 6}
          min={0}
          placeholder="0.1"
          onChange={({ target }) => setAmount(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && destinationChainSelector && amount && destinationAccount && tokenAddress) {
            logAction(providerType, 'TransferTokensAndMessage.click', {
              routerAddress,
              destinationChainSelector,
              destinationAccount,
              tokenAddress,
              amount,
            });
            const result = await ccipClient.transferTokens({
              client: walletClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
              amount: parseEther(amount),
              destinationAccount: destinationAccount as Address,
              tokenAddress: tokenAddress as Address,
              data,
            });
            setMessageId(result.messageId);
            setTxHash(result.txHash);
          }
        }}
      >
        Transfer
      </button>
      {txHash && (
        <div className="flex flex-col w-full">
          <label>TxHash:</label>
          <code className="w-full whitespace-pre-wrap break-all">{txHash}</code>
        </div>
      )}
      {messageId && (
        <div className="flex flex-col w-full">
          <label>MessageId:</label>
          <code className="w-full whitespace-pre-wrap break-all">{messageId}</code>
        </div>
      )}
    </div>
  );
}

function SendCCIPMessage({ walletClient, providerType }: { walletClient: WalletClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [destinationAccount, setDestinationAccount] = useState<string>();
  const [data, setData] = useState<Hex>();
  const [messageId, setMessageId] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Send Message</h2>
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
      <div className="flex flex-col">
        <label htmlFor="destinationAccount">Destination Account*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="destinationAccount"
          placeholder="0x..."
          onChange={({ target }) => setDestinationAccount(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="message">Message*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="message"
          placeholder="Message"
          onChange={({ target }) => setData(encodeAbiParameters([{ type: "string", name: "data" }], [target.value]))}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && destinationChainSelector && destinationAccount && data) {
            logAction(providerType, 'SendCCIPMessage.click', {
              routerAddress,
              destinationChainSelector,
              destinationAccount,
            });
            const result = await ccipClient.sendCCIPMessage({
              client: walletClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
              destinationAccount: destinationAccount as Address,
              data,
            });
            setMessageId(result.messageId);
            setTxHash(result.txHash);
          }
        }}
      >
        Send Message
      </button>
      {txHash && (
        <div className="flex flex-col w-full">
          <label>TxHash:</label>
          <code className="w-full whitespace-pre-wrap break-all">{txHash}</code>
        </div>
      )}
      {messageId && (
        <div className="flex flex-col w-full">
          <label>MessageId:</label>
          <code className="w-full whitespace-pre-wrap break-all">{messageId}</code>
        </div>
      )}
    </div>
  );
}

function SendFunctionData({ walletClient, providerType }: { walletClient: WalletClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [destinationAccount, setDestinationAccount] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [data, setData] = useState<Hex>();
  const [messageId, setMessageId] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Send Function Data</h2>
      <p className="italic">Using ERC20 transfer function</p>
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
      <div className="flex flex-col">
        <label htmlFor="destinationAccount">Destination Account*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="destinationAccount"
          placeholder="0x..."
          onChange={({ target }) => setDestinationAccount(target.value)}
        />
      </div>
      <div className="flex flex-col w-full">
        <label htmlFor="amount">Amount*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="amount"
          type="number"
          step={10 / 10 ** 6}
          min={0}
          placeholder="0.1"
          onChange={({ target }) => setAmount(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && destinationChainSelector && destinationAccount && amount) {
            logAction(providerType, 'SendFunctionData.click', {
              routerAddress,
              destinationChainSelector,
              destinationAccount,
              amount,
            });
            const result = await ccipClient.sendCCIPMessage({
              client: walletClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
              destinationAccount: destinationAccount as Address,
              data: encodeFunctionData({
                abi: IERC20ABI,
                functionName: "transfer",
                args: [destinationAccount, parseEther(amount)],
              }),
            });
            setMessageId(result.messageId);
            setTxHash(result.txHash);
          }
        }}
      >
        Send Message
      </button>
      {txHash && (
        <div className="flex flex-col w-full">
          <label>TxHash:</label>
          <code className="w-full whitespace-pre-wrap break-all">{txHash}</code>
        </div>
      )}
      {messageId && (
        <div className="flex flex-col w-full">
          <label>MessageId:</label>
          <code className="w-full whitespace-pre-wrap break-all">{messageId}</code>
        </div>
      )}
    </div>
  );
}

function GetAllowance({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [account, setAccount] = useState<string>();
  const [allowance, setAllowance] = useState<string>();
  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get allowance:</h2>
      <div className="flex flex-col">
        <label htmlFor="routerAddress">Router Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="routerAddress"
          placeholder="0x..."
          onChange={({ target }) => setRouterAddress(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="account">Account address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="account"
          placeholder="0x..."
          onChange={({ target }) => setAccount(target.value)}
        />
      </div>

      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (account && routerAddress && tokenAddress) {
            logAction(providerType, 'GetAllowance.click', { routerAddress, tokenAddress, account });
            const result = await ccipClient.getAllowance({
              client: publicClient,
              routerAddress: routerAddress as Address,
              tokenAddress: tokenAddress as Address,
              account: account as Address,
            });
            setAllowance(result.toLocaleString());
          }
        }}
      >
        Get allowance
      </button>
      {allowance && (
        <div className="flex flex-col w-full">
          <label>Allowance:</label>
          <code className="w-full whitespace-pre-wrap break-all">{allowance}</code>
        </div>
      )}
    </div>
  );
}

function GetOnRampAddress({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [onRamp, setOnRamp] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get On-ramp address:</h2>
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
          if (routerAddress && destinationChainSelector) {
            logAction(providerType, 'GetOnRampAddress.click', { routerAddress, destinationChainSelector });
            const result = await ccipClient.getOnRampAddress({
              client: publicClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
            });
            setOnRamp(result);
          }
        }}
      >
        Get On-ramp
      </button>
      {onRamp && (
        <div className="flex flex-col w-full">
          <label>On-ramp contract address:</label>
          <code className="w-full whitespace-pre-wrap break-all">{onRamp}</code>
        </div>
      )}
    </div>
  );
}

function GetSupportedFeeTokens({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [supportedFeeTokens, setSupportedFeeTokens] = useState<Address[]>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get supported fee tokens:</h2>
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
          if (routerAddress && destinationChainSelector) {
            logAction(providerType, 'GetSupportedFeeTokens.click', { routerAddress, destinationChainSelector });
            const supportedFeeTokens = await ccipClient.getSupportedFeeTokens({
              client: publicClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
            });
            setSupportedFeeTokens(supportedFeeTokens);
          }
        }}
      >
        Get supported fee tokens
      </button>
      {supportedFeeTokens && supportedFeeTokens.length > 0 && (
        <div className="flex flex-col w-full">
          <label>Supported fee tokens:</label>
          <code className="w-full whitespace-pre-wrap break-all">
            {supportedFeeTokens.map(address => (
              <pre className="w-full whitespace-pre-wrap break-all" key={address}>
                {address}
              </pre>
            ))}
          </code>
        </div>
      )}
    </div>
  );
}

function GetLaneRateRefillLimits({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [rateLimits, setRateLimits] = useState<RateLimiterState>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get lane rate refil limits:</h2>
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
          if (routerAddress && destinationChainSelector) {
            logAction(providerType, 'GetLaneRateRefillLimits.click', { routerAddress, destinationChainSelector });
            const rateLimiterState = await ccipClient.getLaneRateRefillLimits({
              client: publicClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
            });
            setRateLimits(rateLimiterState);
          }
        }}
      >
        Get lane rate refil limits
      </button>
      {rateLimits && (
        <div className="flex flex-col w-full">
          <label>Lane rate limits:</label>
          <code className="w-full whitespace-pre-wrap break-all">
            <pre className="w-full whitespace-pre-wrap break-all">
              {`Tokens: ${rateLimits.tokens.toLocaleString()}`}
            </pre>
            <pre className="w-full whitespace-pre-wrap break-all">
              {`Last updated: ${new Date(rateLimits.lastUpdated * 1000).toLocaleString()}`}
            </pre>
            <pre className="w-full whitespace-pre-wrap break-all">{`Is enabled: ${rateLimits.isEnabled.toString()}`}</pre>
            <pre className="w-full whitespace-pre-wrap break-all">{`Capacity: ${rateLimits.capacity.toLocaleString()}`}</pre>
            <pre className="w-full whitespace-pre-wrap break-all">{`Rate: ${rateLimits.rate.toLocaleString()}`}</pre>
          </code>
        </div>
      )}
    </div>
  );
}

function GetTokenRateLimitByLane({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [tokenRateLimits, setTokenRateLimits] = useState<RateLimiterState>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get token rate limit by lane:</h2>
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
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && destinationChainSelector && tokenAddress) {
            logAction(providerType, 'GetTokenRateLimitByLane.click', { routerAddress, destinationChainSelector, tokenAddress });
            const tokenRateLimiterState = await ccipClient.getTokenRateLimitByLane({
              client: publicClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
              supportedTokenAddress: tokenAddress as Address,
            });
            setTokenRateLimits(tokenRateLimiterState);
          }
        }}
      >
        Get lane rate refil limits
      </button>
      {tokenRateLimits && (
        <>
          <div className="flex flex-col w-full">
            <label>Token lane rate limits:</label>
            <code className="w-full whitespace-pre-wrap break-all">
              <pre className="w-full whitespace-pre-wrap break-all">
                {`Tokens: ${tokenRateLimits.tokens.toLocaleString()}`}
              </pre>
              <pre className="w-full whitespace-pre-wrap break-all">
                {`Last updated: ${new Date(tokenRateLimits.lastUpdated * 1000).toLocaleString()}`}
              </pre>
              <pre className="w-full whitespace-pre-wrap break-all">{`Is enabled: ${tokenRateLimits.isEnabled.toString()}`}</pre>
              <pre className="w-full whitespace-pre-wrap break-all">{`Capacity: ${tokenRateLimits.capacity.toLocaleString()}`}</pre>
              <pre className="w-full whitespace-pre-wrap break-all">{`Rate: ${tokenRateLimits.rate.toLocaleString()}`}</pre>
            </code>
          </div>
        </>
      )}
    </div>
  );
}

function IsTokenSupported({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [isTokenSupported, setIsTokenSupported] = useState<string>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Is token supported:</h2>
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
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && destinationChainSelector && tokenAddress) {
            logAction(providerType, 'IsTokenSupported.click', { routerAddress, destinationChainSelector, tokenAddress });
            const tokenSupported = await ccipClient.isTokenSupported({
              client: publicClient,
              routerAddress: routerAddress as Address,
              tokenAddress: tokenAddress as Address,
              destinationChainSelector,
            });
            setIsTokenSupported(tokenSupported.toString());
          }
        }}
      >
        Is token supported
      </button>
      {isTokenSupported && (
        <div className="flex flex-col w-full">
          <label>Is token supported:</label>
          <code className="w-full whitespace-pre-wrap break-all">{isTokenSupported.toLocaleString()}</code>
        </div>
      )}
    </div>
  );
}

function GetTokenAdminRegistry({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [tokenAdminRegistry, setTokenAdminRegistry] = useState<string>();
  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Token admin registry:</h2>
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
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && tokenAddress && destinationChainSelector) {
            logAction(providerType, 'GetTokenAdminRegistry.click', { routerAddress, destinationChainSelector, tokenAddress });
            const tokenAdminRegistryResult = await ccipClient.getTokenAdminRegistry({
              client: publicClient,
              routerAddress: routerAddress as Address,
              tokenAddress: tokenAddress as Address,
              destinationChainSelector,
            });
            setTokenAdminRegistry(tokenAdminRegistryResult);
          }
        }}
      >
        Token admin registry
      </button>
      {tokenAdminRegistry && (
        <div className="flex flex-col w-full">
          <label>Token admin registry address:</label>
          <code className="w-full whitespace-pre-wrap break-all">{tokenAdminRegistry.toLocaleString()}</code>
        </div>
      )}
    </div>
  );
}

function GetTransactionReceipt({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [hash, setHash] = useState<string>();
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get transaction receipt:</h2>

      <div className="flex flex-col">
        <label htmlFor="messageId">Hash</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="messageId"
          placeholder="0x..."
          onChange={({ target }) => setHash(target.value)}
        />
      </div>

      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (hash) {
            logAction(providerType, 'GetTransactionReceipt.click', { hash });
            const transactionReceiptResult = await ccipClient.getTransactionReceipt({
              client: publicClient,
              hash: hash as Hash,
            });
            setTransactionReceipt(transactionReceiptResult);
          }
        }}
      >
        Get transaction receipt
      </button>
      {transactionReceipt && (
        <>
          <p>{`Block Number: ${transactionReceipt.blockNumber.toString()}`}</p>
          <p>{`From: ${transactionReceipt.from}`}</p>
          <p>{`To: ${transactionReceipt.to}`}</p>
          <p>{`Status: ${transactionReceipt.status}`}</p>
          <div className="flex flex-col w-full">
            <label>Transaction receipt:</label>
            <code className="w-full whitespace-pre-wrap break-all">
              <pre className="w-full whitespace-pre-wrap break-all">
                {`Block Number: ${transactionReceipt.blockNumber.toString()}`}
              </pre>
              <pre className="w-full whitespace-pre-wrap break-all">{`From: ${transactionReceipt.from}`}</pre>
              <pre className="w-full whitespace-pre-wrap break-all">{`To: ${transactionReceipt.to}`}</pre>
              <pre className="w-full whitespace-pre-wrap break-all">{`Status: ${transactionReceipt.status}`}</pre>
            </code>
          </div>
        </>
      )}
    </div>
  );
}

function GetTransferStatus({ providerType }: { providerType: "wagmi" | "ethers" }) {
  const { chains } = useSwitchChain();
  const [destinationRouterAddress, setDestinationRouterAddress] = useState<string>();
  const [destinationChainId, setDestinationChainId] = useState<number>();
  const [sourceChainSelector, setSourceChainSelector] = useState<string>();
  const [messageId, setMessageId] = useState<string>();
  const [transferStatus, setTransferStatus] = useState<TransferStatus | null>();

  const destinationChainPublicClient = usePublicClient({
    chainId: destinationChainId,
  });

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get transfer status:</h2>
      <div className="space-y-2">
        <div className="flex flex-col">
          <label htmlFor="destinationRouterAddress">Destination router address</label>
          <input
            className="border border-slate-300 rounded-md p-1"
            name="destinationRouterAddress"
            placeholder="0x..."
            onChange={({ target }) => setDestinationRouterAddress(target.value)}
          />
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="destinationChainId">Destination chain id</label>
          <select
            className="border border-slate-300 rounded-md p-1"
            onChange={e => setDestinationChainId(Number(e.target.value))}
          >
            {chains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="sourceChainSelector">Source chain selector</label>
          <input
            className="border border-slate-300 rounded-md p-1"
            name="sourceChainSelector"
            placeholder="1234..."
            onChange={({ target }) => setSourceChainSelector(target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="messageId">Message ID</label>
          <input
            className="border border-slate-300 rounded-md p-1"
            name="messageId"
            placeholder="0x..."
            onChange={({ target }) => setMessageId(target.value)}
          />
        </div>
      </div>
      <div className="space-x-2">
        <button
          className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
          onClick={async () => {
            if (destinationChainPublicClient && destinationRouterAddress && sourceChainSelector && messageId) {
              logAction(providerType, 'GetTransferStatus.click', {
                destinationRouterAddress,
                sourceChainSelector,
                messageId,
                destinationChainId,
              });
              const transferStatusResult = await ccipClient.getTransferStatus({
                client: destinationChainPublicClient,
                destinationRouterAddress: destinationRouterAddress as Address,
                sourceChainSelector,
                messageId: messageId as Hash,
              });
              setTransferStatus(transferStatusResult);
            }
          }}
        >
          Get transfer status
        </button>
        {transferStatus && <p>{transferStatus}</p>}
      </div>
    </div>
  );
}

function GetFee({ publicClient, providerType }: { publicClient: PublicClient; providerType: "wagmi" | "ethers" }) {
  const [routerAddress, setRouterAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [destinationChainSelector, setDestinationChainSelector] = useState<string>();
  const [destinationAccount, setDestinationAccount] = useState<string>();
  const [data, setData] = useState<Hex>();
  const [fee, setFee] = useState<string>();

  return (
    <div className="space-y-2 border rounded-md p-4 bg-white">
      <h2 className="font-bold">Get fee</h2>
      <div className="flex flex-col">
        <label htmlFor="routerAddress">Router Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="routerAddress"
          placeholder="0x..."
          onChange={({ target }) => setRouterAddress(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="tokenAddress">Token Address*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="tokenAddress"
          placeholder="0x..."
          onChange={({ target }) => setTokenAddress(target.value)}
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
      <div className="flex flex-col">
        <label htmlFor="destinationAccount">Destination Account*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="destinationAccount"
          placeholder="0x..."
          onChange={({ target }) => setDestinationAccount(target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="message">Message</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="message"
          placeholder="0x..."
          onChange={({ target }) => setData(encodeAbiParameters([{ type: "string", name: "data" }], [target.value]))}
        />
      </div>
      <div className="flex flex-col w-full">
        <label htmlFor="amount">Amount*</label>
        <input
          className="border border-slate-300 rounded-md p-1"
          name="amount"
          type="number"
          step={10 / 10 ** 6}
          min={0}
          placeholder="0.1"
          onChange={({ target }) => setAmount(target.value)}
        />
      </div>
      <button
        className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
        onClick={async () => {
          if (routerAddress && destinationChainSelector && amount && destinationAccount && tokenAddress) {
            logAction(providerType, 'GetFee.click', {
              routerAddress,
              destinationChainSelector,
              destinationAccount,
              tokenAddress,
              amount,
            });
            const result = await ccipClient.getFee({
              client: publicClient,
              routerAddress: routerAddress as Address,
              destinationChainSelector,
              amount: parseEther(amount),
              destinationAccount: destinationAccount as Address,
              tokenAddress: tokenAddress as Address,
              data,
            });
            setFee(result.toLocaleString());
          }
        }}
      >
        Get fee
      </button>
      {fee && (
        <div className="flex flex-col w-full">
          <label>Fee:</label>
          <code className="w-full whitespace-pre-wrap break-all">{fee}</code>
        </div>
      )}
    </div>
  );
}
