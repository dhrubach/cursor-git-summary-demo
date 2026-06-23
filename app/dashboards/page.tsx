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

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-medium">API Keys</h2>
            <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              Create API Key
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">Production</td>
                  <td className="px-4 py-3 font-mono">sk_live_********</td>
                  <td className="px-4 py-3">Today</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="mr-3 text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
                      Edit
                    </button>
                    <button className="text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      Revoke
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
