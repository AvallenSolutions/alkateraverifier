import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/ui/AppHeader";

/**
 * Authenticated app shell. The proxy already redirects signed-out visitors;
 * this server-side check is defence in depth.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader userEmail={user.email ?? ""} />
      <main className="mx-auto w-full max-w-content flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
