import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomBand } from "@/components/ui/RoomBand";
import { InkBand } from "@/components/ui/InkBand";

/**
 * Authenticated app shell — the studio room anatomy: sticky ink band on
 * top, paper in between, the standing independence strip on the bottom.
 * The proxy already redirects signed-out visitors; this check is defence
 * in depth.
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
      <RoomBand userEmail={user.email ?? ""} />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <InkBand />
    </div>
  );
}
