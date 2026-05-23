export default function Loading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_44%,_#111827_100%)] px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center justify-between gap-4 rounded-full border border-cyan-400/20 bg-slate-950/60 px-5 py-3 backdrop-blur animate-pulse">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_6px_rgba(239,68,68,0.15)]" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-slate-700" />
              <div className="h-2.5 w-52 rounded-full bg-slate-700/80" />
            </div>
          </div>
          <div className="h-10 w-36 rounded-full bg-slate-700" />
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/70 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur">
          <div className="border-b border-slate-800 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent px-6 py-4 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-full bg-slate-700/80 animate-pulse" />
                <div className="h-8 w-[min(34rem,90vw)] rounded-full bg-slate-700/80 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="h-3 w-28 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="aspect-[16/10] rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-slate-700 bg-[linear-gradient(135deg,_rgba(15,23,42,0.85),_rgba(30,41,59,0.9))]">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-700 animate-pulse" />
                    <div className="h-3 w-44 rounded-full bg-slate-700/80 animate-pulse" />
                    <div className="h-2.5 w-32 rounded-full bg-slate-700/80 animate-pulse mx-auto" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="h-3 w-28 rounded-full bg-slate-700/80 animate-pulse" />
                  <div className="mt-3 h-8 w-36 rounded-full bg-slate-700/80 animate-pulse" />
                  <div className="mt-3 h-2.5 w-24 rounded-full bg-slate-700/60 animate-pulse" />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="h-3 w-28 rounded-full bg-slate-700/80 animate-pulse" />
                  <div className="mt-3 h-8 w-28 rounded-full bg-slate-700/80 animate-pulse" />
                  <div className="mt-3 h-2.5 w-32 rounded-full bg-slate-700/60 animate-pulse" />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="h-3 w-24 rounded-full bg-slate-700/80 animate-pulse" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="h-11 rounded-full bg-slate-800 animate-pulse" />
                  <div className="h-11 rounded-full bg-slate-800 animate-pulse" />
                  <div className="h-11 rounded-full bg-slate-800 animate-pulse sm:col-span-2" />
                </div>
                <div className="mt-4 h-12 rounded-2xl bg-slate-800 animate-pulse" />
              </div>
            </div>

            <aside className="space-y-4 rounded-[1.75rem] border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded-full bg-slate-700/80 animate-pulse" />
                <div className="h-3 w-16 rounded-full bg-slate-700/80 animate-pulse" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <div className="h-3 w-20 rounded-full bg-slate-700/80 animate-pulse" />
                    <div className="mt-2 h-6 w-32 rounded-full bg-slate-700/80 animate-pulse" />
                    <div className="mt-3 h-2.5 w-40 rounded-full bg-slate-700/60 animate-pulse" />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 p-4">
                <div className="h-3 w-28 rounded-full bg-slate-700/80 animate-pulse" />
                <div className="mt-3 h-2.5 w-full rounded-full bg-slate-700/60 animate-pulse" />
                <div className="mt-2 h-2.5 w-4/5 rounded-full bg-slate-700/60 animate-pulse" />
              </div>
            </aside>
          </div>
        </div>

        <p className="text-center text-sm tracking-wide text-slate-400">
          Connecting to TechMart Real-Time Auction Mesh Network...
        </p>
      </div>
    </div>
  );
}
