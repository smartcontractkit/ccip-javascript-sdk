import { CCIPEthers } from "@/components/ccip-with-ethers";
import { Providers } from "./providers";

export default function CCIPJsPage() {
  return (
    <Providers>
      <CCIPEthers />
    </Providers>
  );
}
