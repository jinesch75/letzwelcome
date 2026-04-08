import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Letzwelcome — Find belonging in Luxembourg",
  description: "Connect with a local buddy, join community events, and discover everything you need to settle in Luxembourg.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
