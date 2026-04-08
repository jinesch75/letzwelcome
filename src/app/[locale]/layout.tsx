import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "Letzwelcome — Find belonging in Luxembourg",
  description:
    "Connect with a local buddy, join community events, and discover everything you need to settle in Luxembourg.",
  openGraph: {
    title: "Letzwelcome — Find belonging in Luxembourg",
    description:
      "Connect with a local buddy, join community events, and discover everything you need to settle in Luxembourg.",
    locale: "en",
    type: "website",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-lw-cream text-lw-charcoal min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
