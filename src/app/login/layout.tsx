import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — GStreet Ledger",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
