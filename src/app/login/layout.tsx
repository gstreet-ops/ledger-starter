import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Ledger Starter",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
