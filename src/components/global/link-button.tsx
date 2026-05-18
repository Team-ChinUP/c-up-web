import React from "react";
import Link, { LinkProps } from "next/link";

type AppLinkProps = Omit<LinkProps, "className"> & {
  children?: React.ReactNode;
};

export default function LinkButton({ children, ...rest }: AppLinkProps) {
  return (
    <Link
      className="w-360 px-24 py-16 border-gradient-surface rounded-30 font-pretendard-semibold text-text transition-opacity text-18 active:opacity-70 cursor-pointer no-underline text-center select-none"
      {...(rest as LinkProps)}
    >
      {children}
    </Link>
  );
}
