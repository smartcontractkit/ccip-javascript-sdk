export const SwapSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.5 9.5V22.25"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:translate-y-[1px] transition-transform stroke-ccip-text"
    />
    <path
      d="M12.5 19.25L9.5 22.25L6.5 19.25"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:translate-y-[1px] transition-transform stroke-ccip-text"
    />
    <path
      d="M15.5 14.5V1.75"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:translate-y-[-1px] transition-transform stroke-ccip-text"
    />
    <path
      d="M12.5 4.75L15.5 1.75L18.5 4.75"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:translate-y-[-1px] transition-transform stroke-ccip-text"
    />
  </svg>
);
