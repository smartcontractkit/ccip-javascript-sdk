"use client";

import { createClient, IERC20ABI, RateLimiterState, TransferStatus, SupportedClient } from "@chainlink/ccip-js";
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
import { useState, useEffect } from "react"; // Added useEffect

import { ethers, BrowserProvider, Signer } from "ethers"; // Added BrowserProvider, Signer

const ccipClient = createClient();

export function CCIPEthers() {
    const [ethersProvider, setEthersProvider] = useState<BrowserProvider | undefined>(undefined);
    const [ethersSigner, setEthersSigner] = useState<Signer | undefined>(undefined);
    const [ethersErrorMessage, setEthersErrorMessage] = useState<string | null>(null);

    return (
        <div className="m-2 p-2 w-full grid md:grid-cols-2 gap-2">
            {!ethersProvider && !ethersSigner && (
                <ConnectWallet
                    setEthersProvider={setEthersProvider}
                    setEthersSigner={setEthersSigner}
                    setEthersErrorMessage={setEthersErrorMessage}
                />
            )}
            {ethersErrorMessage && (
                <div className="col-span-2 text-red-500 text-center">{ethersErrorMessage}</div>
            )}
            {ethersProvider && (
                <>
                    <GetAllowance ethersProvider={ethersProvider} />
                    <GetOnRampAddress ethersProvider={ethersProvider} />
                    <GetSupportedFeeTokens ethersProvider={ethersProvider} />
                    <GetLaneRateRefillLimits ethersProvider={ethersProvider} />
                    <IsTokenSupported ethersProvider={ethersProvider} />
                    <GetTokenRateLimitByLane ethersProvider={ethersProvider} />
                    <GetTokenAdminRegistry ethersProvider={ethersProvider} />
                    <GetTransactionReceipt ethersProvider={ethersProvider} />
                    <GetFee ethersProvider={ethersProvider} />
                </>
            )}
            {ethersSigner && (
                <>
                    <ApproveRouter ethersSigner={ethersSigner} />
                    <TransferTokensAndMessage ethersSigner={ethersSigner} />
                    <SendCCIPMessage ethersSigner={ethersSigner} />
                    <SendFunctionData ethersSigner={ethersSigner} />
                </>
            )}
        </div>
    );
}

interface ConnectWalletProps {
    setEthersProvider: React.Dispatch<React.SetStateAction<BrowserProvider | undefined>>;
    setEthersSigner: React.Dispatch<React.SetStateAction<Signer | undefined>>;
    setEthersErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

function ConnectWallet({ setEthersProvider, setEthersSigner, setEthersErrorMessage }: ConnectWalletProps) {
    const [currentAccount, setCurrentAccount] = useState<string | null>(null);
    const [currentChainId, setCurrentChainId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
    const [connectError, setConnectError] = useState<string | null>(null);
    const [switchChainError, setSwitchChainError] = useState<string | null>(null);

    const availableChains = [
        { id: 43113, name: "Avalanche Fuji", hexId: "0xA28A" }, // Example: Avalanche Fuji testnet
        { id: 11155111, name: "Sepolia", hexId: "0xAA36A7" }, // Example: Sepolia testnet
        // Add other chains as needed
    ];

    useEffect(() => {
        const initEthersConnection = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                try {
                    setConnectionStatus("Connecting...");
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        setCurrentAccount(accounts[0]);
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        setEthersProvider(provider);
                        const signer = await provider.getSigner();
                        setEthersSigner(signer);
                        const network = await provider.getNetwork();
                        setCurrentChainId(`${network.chainId}`);
                        setConnectionStatus("Connected");
                        setConnectError(null);
                    } else {
                        setConnectionStatus("Disconnected");
                        setCurrentAccount(null);
                        setEthersProvider(undefined);
                        setEthersSigner(undefined);
                    }

                    const handleAccountsChanged = (accounts: string[]) => {
                        console.log('Ethers: Accounts changed:', accounts);
                        if (accounts.length === 0) {
                            setCurrentAccount(null);
                            setEthersProvider(undefined);
                            setEthersSigner(undefined);
                            setConnectionStatus("Disconnected");
                            setEthersErrorMessage("MetaMask disconnected or no accounts available.");
                        } else {
                            setCurrentAccount(accounts[0]);
                            initEthersConnection(); // Re-initialize provider/signer with new account
                            setEthersErrorMessage(null);
                        }
                    };

                    const handleChainChanged = (chainId: string) => {
                        console.log('Ethers: Chain changed:', chainId);
                        setCurrentChainId(parseInt(chainId, 16).toString());
                        initEthersConnection(); // Re-initialize provider/signer for new chain
                        setEthersErrorMessage(null);
                    };

                    window.ethereum.on('accountsChanged', handleAccountsChanged);
                    window.ethereum.on('chainChanged', handleChainChanged);

                    return () => {
                        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                        window.ethereum.removeListener('chainChanged', handleChainChanged);
                    };
                } catch (error: any) {
                    console.error("Ethers: Failed to connect or initialize:", error);
                    setConnectionStatus("Disconnected");
                    const errorMessage = `Ethers: Failed to connect or initialize: ${error.message || error}`;
                    setConnectError(errorMessage);
                    setEthersErrorMessage(errorMessage);
                }
            } else {
                setConnectionStatus("Disconnected");
                const errorMessage = "Ethers: MetaMask or compatible wallet not detected.";
                setConnectError(errorMessage);
                setEthersErrorMessage(errorMessage);
            }
        };

        initEthersConnection();
    }, []);

    const handleConnectWallet = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                setConnectionStatus("Connecting...");
                setConnectError(null);
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const provider = new ethers.BrowserProvider(window.ethereum);
                setEthersProvider(provider);
                const signer = await provider.getSigner();
                setEthersSigner(signer);
                const network = await provider.getNetwork();
                setCurrentChainId(`${network.chainId}`);
                setCurrentAccount(await signer.getAddress());
                setConnectionStatus("Connected");
                setEthersErrorMessage(null);
            } catch (error: any) {
                console.error("Ethers: Failed to connect to MetaMask:", error);
                setConnectionStatus("Disconnected");
                const errorMessage = `Ethers: Failed to connect to MetaMask: ${error.message || error}`;
                setConnectError(errorMessage);
                setEthersErrorMessage(errorMessage);
            }
        } else {
            const errorMessage = "Ethers: MetaMask or compatible wallet not detected.";
            setConnectError(errorMessage);
            setEthersErrorMessage(errorMessage);
        }
    };

    const handleSwitchChain = async (newChainId: string) => {
        if (window.ethereum) {
            try {
                setSwitchChainError(null);
                const targetChain = availableChains.find(c => `${c.id}` === newChainId);
                if (!targetChain) {
                    throw new Error(`Chain with id ${newChainId} not found.`);
                }
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChain.hexId }],
                });
                // ChainChanged event listener will handle updating currentChainId and re-initializing provider/signer
            } catch (error: any) {
                console.error("Ethers: Failed to switch chain:", error);
                const errorMessage = `Ethers: Failed to switch chain: ${error.message || error}`;
                setSwitchChainError(errorMessage);
                setEthersErrorMessage(errorMessage);
            }
        }
    };

    return (
        <div className="space-y-2 border rounded-md p-4 bg-white">
            <h2 className="font-bold">Connect Wallet (Ethers.js):</h2>
            <div className="space-x-2">
                <button
                    className="rounded-md p-2 bg-black text-white hover:bg-slate-600 transition-colors"
                    onClick={handleConnectWallet}
                    disabled={connectionStatus === "Connected" || connectionStatus === "Connecting..."}
                >
                    {connectionStatus === "Connecting..." ? "Connecting..." : "Connect MetaMask"}
                </button>
            </div>
            {connectError && <p className="text-red-500">{connectError}</p>}
            {currentAccount && <p>{`Address: ${currentAccount}`}</p>}
            {currentChainId && (
                <>
                    <p>{`Connected to Chain ID: ${currentChainId} (Status: ${connectionStatus})`}</p>
                    <div className="flex flex-col">
                        <label htmlFor="chainId">Switch to chain</label>
                        <select
                            className="border border-slate-300 rounded-md p-1"
                            name="chainId"
                            value={currentChainId}
                            onChange={e => handleSwitchChain(e.target.value)}
                        >
                            {availableChains.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} (ID: {c.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    {switchChainError && <p className="text-red-500">{switchChainError}</p>}
                </>
            )}
        </div>
    );
}

function ApproveRouter({ ethersSigner }: { ethersSigner: SupportedClient }) { // Changed WalletClient to SupportedClient
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
                        const result = await ccipClient.approveRouter({
                            client: ethersSigner, // Now accepts SupportedClient
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

function TransferTokensAndMessage({ ethersSigner }: { ethersSigner: SupportedClient }) { // Changed WalletClient to SupportedClient
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
                        const result = await ccipClient.transferTokens({
                            client: ethersSigner, // Now accepts SupportedClient
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

function SendCCIPMessage({ ethersSigner }: { ethersSigner: SupportedClient }) { // Changed WalletClient to SupportedClient
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
                        const result = await ccipClient.sendCCIPMessage({
                            client: ethersSigner, // Now accepts SupportedClient
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

function SendFunctionData({ ethersSigner }: { ethersSigner: SupportedClient }) { // Changed WalletClient to SupportedClient
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
                        const result = await ccipClient.sendCCIPMessage({
                            client: ethersSigner, // Now accepts SupportedClient
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

function GetAllowance({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const result = await ccipClient.getAllowance({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetOnRampAddress({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const result = await ccipClient.getOnRampAddress({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetSupportedFeeTokens({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const supportedFeeTokens = await ccipClient.getSupportedFeeTokens({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetLaneRateRefillLimits({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const rateLimiterState = await ccipClient.getLaneRateRefillLimits({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetTokenRateLimitByLane({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const tokenRateLimiterState = await ccipClient.getTokenRateLimitByLane({
                            client: ethersProvider, // Now accepts SupportedClient
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

function IsTokenSupported({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const tokenSupported = await ccipClient.isTokenSupported({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetTokenAdminRegistry({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const tokenAdminRegistryResult = await ccipClient.getTokenAdminRegistry({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetTransactionReceipt({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const transactionReceiptResult = await ccipClient.getTransactionReceipt({
                            client: ethersProvider, // Now accepts SupportedClient
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

function GetFee({ ethersProvider }: { ethersProvider: SupportedClient }) { // Changed PublicClient to SupportedClient
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
                        const result = await ccipClient.getFee({
                            client: ethersProvider, // Now accepts SupportedClient
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
