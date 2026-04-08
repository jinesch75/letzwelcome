import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainShell from "@/components/layout/MainShell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/en/login");
  }

  const user = {
    id: session.user.id!,
    name: session.user.name || "User",
    email: session.user.email || "",
    image: session.user.image || undefined,
    role: (session.user as any).role || "NEWCOMER",
  };

  return <MainShell user={user}>{children}</MainShell>;
}
