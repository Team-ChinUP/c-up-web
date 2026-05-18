"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  ctaHref?: string;
  ctaText?: string;
};

export default function AuthShell({ title, children, ctaHref, ctaText }: Props) {
  return (
    <div className="flex flex-col gap-32 items-center">
      <p className="text-text text-28 font-pretendard-semibold">{title}</p>
      <div>{children}</div>
      {ctaHref && (
        <Link className="text-placeholder text-16 underline" href={ctaHref}>
          {ctaText}
        </Link>
      )}
    </div>
  );
}
