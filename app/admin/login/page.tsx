import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            TechMart Admin
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">Admin access</h1>
          <p className="mt-2 text-sm text-slate-300">
            Access the admin panel with your authorized credentials.
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
