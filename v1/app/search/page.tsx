import { RouteShell } from "../_components/route-shell";
import { searchResults } from "../../lib/customer";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <RouteShell
          eyebrow="Search"
          title="Global search"
          description="Search starter for autocomplete, fuzzy matches, brand suggestions, and category browsing."
        >
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Search query
                <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500" placeholder="Try: samsing, S24, Sony" />
              </label>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600">Autocomplete starts after 2 characters.</div>
            </div>

            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={`${result.category}-${result.title}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{result.category}</p>
                  <h2 className="mt-2 text-lg font-bold text-slate-950">{result.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{result.note}</p>
                </div>
              ))}
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}