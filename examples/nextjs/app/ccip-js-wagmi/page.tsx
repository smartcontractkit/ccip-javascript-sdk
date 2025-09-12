import { CCIP } from "@/components/ccip-with-wagmi";
import { Providers } from "./providers";

export default function CCIPJsPage() {
  return (
    <Providers>
      <CCIP />
    </Providers>
  );
}
