import { RouteShell } from "../_components/route-shell";
import { notifications } from "../../lib/notifications";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <RouteShell eyebrow="Notifications" title="Notifications" description="Recent account and auction notifications.">
          <div className="mt-4 space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`rounded-2xl border p-4 ${n.read ? 'bg-white' : 'bg-white/95'} text-sm`}>
                <p className="font-semibold text-slate-900">{n.title} <span className="text-xs text-slate-500">· {n.date}</span></p>
                <p className="mt-2 text-slate-700">{n.body}</p>
              </div>
            ))}
          </div>
        </RouteShell>
      </div>
    </main>
  );
}
