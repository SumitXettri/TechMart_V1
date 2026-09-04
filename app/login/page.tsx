import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] px-6 py-12 text-slate-950">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              TechMart account
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Sign in to your account
            </h1>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
