export const dynamic = "force-dynamic";

export function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Response.json(
    {
      status: supabaseUrl && supabaseKey ? "ok" : "degraded",
      app: "personal-life-os",
      services: {
        application: "ok",
        supabaseConfiguration: supabaseUrl && supabaseKey ? "configured" : "missing",
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: supabaseUrl && supabaseKey ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
