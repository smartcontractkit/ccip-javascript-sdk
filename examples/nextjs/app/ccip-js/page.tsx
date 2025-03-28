import { CCIP } from "@/components/ccip";
import { Providers } from "./providers";
import { sepolia, arbitrumSepolia, avalancheFuji, bscTestnet, polygonAmoy, optimismSepolia } from "viem/chains";

export default function CCIPJsPage() {
  return (
    <Providers chains={[sepolia, arbitrumSepolia, avalancheFuji, bscTestnet, polygonAmoy, optimismSepolia]}>
      <CCIP />
    </Providers>
  );
}
