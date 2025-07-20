import type { SVGProps } from "react";

const SynapseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.5 6.5c-1.5 0-3.1.9-4.5 2.5-1.4-1.6-3-2.5-4.5-2.5-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c1.5 0 3.1-.9 4.5-2.5 1.4 1.6 3 2.5 4.5 2.5 2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);


export const Icons = {
  logo: SynapseIcon,
};
