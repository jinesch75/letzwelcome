import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import prisma from "@/lib/db";

const AdminSidebar = ({ locale }: { locale: string }) => {
  return (
    <aside className="hidden md:flex w-64 bg-lw-charcoal text-lw-cream border-r border-lw-border min-h-screen flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="font-[family-name:var(--font-display)] text-xl">
          Admin Panel
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {[
          { href: `/${locale}/admin`, label: "Dashboard" },
          { href: `/${locale}/admin/moderation`, label: "Moderation" },
          { href: `/${locale}/admin/users`, label: "Users" },
          { href: `/${locale}/admin/content`, label: "Content" },
          { href: `/${locale}/admin/gdpr`, label: "GDPR" },
          { href: `/${locale}/admin/logs`, label: "Activity Log" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 rounded hover:bg-white/10 transition text-sm"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 text-sm text-lw-warm-gray">
        <Link
          href={`/${locale}/dashboard`}
          className="hover:text-lw-cream transition"
        >
          ← Back to app
        </Link>
      </div>
    </aside>
  );
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar locale={locale} />
      <main className="flex-1 bg-lw-cream min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
