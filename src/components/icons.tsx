import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path d="M 128,24 A 104,104 0 1 0 128,232 A 104,104 0 1 0 128,24 Z M 128,216 A 88,88 0 1 1 128,40 A 88,88 0 1 1 128,216 Z" />
        <path d="m 104,80 h 16 v 96 h -16 z" />
        <path d="m 136,80 h 48 a 8,8 0 0 1 0,16 h -32 v 24 h 24 a 8,8 0 0 1 0,16 h -24 v 32 a 8,8 0 0 1 -16,0 z" />
        <path d="m 64,80 h 16 v 96 h -16 z" opacity="0.5"/>
      </g>
    </svg>
  );
}
