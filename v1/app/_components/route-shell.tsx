import type { ReactNode } from "react";

type RouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function RouteShell({ eyebrow, title, description, children }: RouteShellProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{eyebrow}</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}