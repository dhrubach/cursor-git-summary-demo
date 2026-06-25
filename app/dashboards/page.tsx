import { ApiKeysDashboard } from "./api-keys-dashboard";

export default function DashboardsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-8 py-10 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            API Keys Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Create, view, update, and revoke API keys for your applications.
          </p>
        </div>

        <ApiKeysDashboard />
      </section>
    </main>
  );
}
