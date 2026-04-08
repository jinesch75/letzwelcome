export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-lw-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-lw-blue-deep">
            Letzwelcome
          </h1>
          <p className="text-lw-warm-gray mt-1 text-sm font-[family-name:var(--font-accent)]">
            Find belonging in Luxembourg
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
