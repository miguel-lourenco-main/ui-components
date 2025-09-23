import React from "react";
import { cn } from "./utils";
import { CodeIcon, SearchIcon, SlashIcon } from "lucide-react";

export function GitLabIconSingle({
    className,
    inverted,
    ...props
  }: React.ComponentProps<'svg'> & { inverted?: boolean }) {
    const id = React.useId();
  
    return (
      <svg
        viewBox="110 110 170 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('size-4', className)}
        {...props}
      >
         <path
            className="fill-[#e24329]"
            d="m 265.3,174.4 -0.2,-0.6 -21.2,-55.3 c -0.4,-1.1 -1.2,-2 -2.2,-2.6 -1,-0.6 -2.1,-0.9 -3.3,-0.9 -1.2,0 -2.3,0.5 -3.2,1.2 -0.9,0.7 -1.6,1.7 -1.9,2.9 L 219,162.9 h -57.9 l -14.3,-43.8 c -0.3,-1.1 -1,-2.1 -1.9,-2.9 -0.9,-0.7 -2,-1.2 -3.2,-1.2 -1.2,0 -2.3,0.2 -3.3,0.9 -1,0.6 -1.8,1.5 -2.2,2.6 l -21.2,55.3 -0.2,0.6 c -6.3,16.4 -0.9,34.9 13.1,45.5 h 0.2 c 0,0.1 32.3,24.3 32.3,24.3 l 16,12.1 9.7,7.3 c 2.3,1.8 5.6,1.8 7.9,0 l 9.7,-7.3 16,-12.1 32.5,-24.3 v 0 c 14,-10.6 19.3,-29.1 13,-45.5 z"
            id="path6" />
        <path
            className="fill-[#fc6d26]"
            d="m 265.3,174.4 -0.2,-0.6 c -10.5,2.2 -20.2,6.6 -28.5,12.8 -0.1,0 -25.2,19.1 -46.6,35.2 15.8,12 29.6,22.4 29.6,22.4 l 32.5,-24.3 v 0 c 14,-10.6 19.3,-29.1 13,-45.5 z"
            id="path8" />
        <path
            className="fill-[#fca326]"
            d="m 160.3,244.2 16,12.1 9.7,7.3 c 2.3,1.8 5.6,1.8 7.9,0 l 9.7,-7.3 16,-12.1 c 0,0 -13.8,-10.4 -29.6,-22.4 -15.9,12 -29.7,22.4 -29.7,22.4 z"
            id="path10" />
        <path
            className="fill-[#fc6d26]"
            d="m 143.4,186.6 c -8.3,-6.2 -18,-10.7 -28.5,-12.8 l -0.2,0.6 c -6.3,16.4 -0.9,34.9 13.1,45.5 h 0.2 c 0,0.1 32.3,24.3 32.3,24.3 0,0 13.8,-10.4 29.7,-22.4 -21.3,-16.1 -46.4,-35.1 -46.6,-35.2 z"
            id="path12" />
      </svg>
    );
  }

export function CodeOffIcon({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span className={cn('relative inline-block align-middle size-4', className)} {...props}>
      <CodeIcon className="size-full" />
      <SlashIcon className="size-full absolute inset-0 pointer-events-none rotate-90" strokeWidth={2.6} />
    </span>
  );
}

export function SearchOffIcon({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span className={cn('relative inline-block align-middle size-4', className)} {...props}>
      <SearchIcon className="size-full" />
      <SlashIcon className="size-full absolute inset-0 pointer-events-none rotate-90" strokeWidth={2.6} />
    </span>
  );
}