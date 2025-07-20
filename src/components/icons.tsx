import type { SVGProps } from "react";

const SynapseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 2a10 10 0 1 0-9.44 6.64" />
    <path d="M12 2a10 10 0 1 1-6.64 9.44" />
    <path d="M12 2a10 10 0 1 1 .56 9.98" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 4V2" />
    <path d="M12 22v-2" />
    <path d="M20 12h2" />
    <path d="M2 12h2" />
    <path d="m18.36 5.64 1.42-1.42" />
    <path d="m4.22 19.78 1.42-1.42" />
    <path d="m18.36 18.36-1.42-1.42" />
    <path d="m4.22 4.22 1.42 1.42" />
  </svg>
);


export const Icons = {
  logo: SynapseIcon,
};
