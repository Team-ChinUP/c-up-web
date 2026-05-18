import type { ReactNode } from "react";
import styles from "./scrollbar.module.css";

type ScrollbarProps = {
  children: ReactNode;
  className?: string;
};

export default function Scrollbar({ children, className = "" }: ScrollbarProps) {
  return <div className={`${styles.scrollbar} ${className}`}>{children}</div>;
}