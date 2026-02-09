// Silences phantom /__webpack_hmr requests from browser extensions
export async function GET() {
  return new Response(null, { status: 204 });
}
