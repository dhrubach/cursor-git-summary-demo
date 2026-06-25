"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type ApiKeyStatus = "active" | "revoked";

type ApiKey = {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  status: ApiKeyStatus;
};

type ApiKeysResponse = {
  apiKeys: ApiKey[];
};

type ApiKeyResponse = {
  apiKey: ApiKey;
};

type CreateApiKeyResponse = ApiKeyResponse & {
  secret: string;
};

type ApiErrorResponse = {
  error?: string;
};

const requestJson = async <ResponseBody,>(
  input: RequestInfo,
  init?: RequestInit,
) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(body?.error ?? "Something went wrong.");
  }

  return (await response.json()) as ResponseBody;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

const getStatusClasses = (status: ApiKeyStatus) => {
  if (status === "active") {
    return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  }

  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
};

export function ApiKeysDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeKeyCount = useMemo(
    () => apiKeys.filter((apiKey) => apiKey.status === "active").length,
    [apiKeys],
  );

  useEffect(() => {
    let isCurrent = true;

    const loadApiKeys = async () => {
      try {
        const body = await requestJson<ApiKeysResponse>("/api/api-keys");

        if (isCurrent) {
          setApiKeys(body.apiKeys);
          setError(null);
        }
      } catch (caughtError) {
        if (isCurrent) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load API keys.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadApiKeys();

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleCreateApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = newKeyName.trim();

    if (!name) {
      setError("Enter a name for the API key.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const body = await requestJson<CreateApiKeyResponse>("/api/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setApiKeys((currentApiKeys) => [body.apiKey, ...currentApiKeys]);
      setNewKeyName("");
      setNewSecret(body.secret);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create API key.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = (apiKey: ApiKey) => {
    setEditingId(apiKey.id);
    setEditingName(apiKey.name);
    setError(null);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdateApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    const name = editingName.trim();

    if (!name) {
      setError("API key name must not be empty.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const body = await requestJson<ApiKeyResponse>(
        `/api/api-keys/${editingId}`,
        {
          method: "PUT",
          body: JSON.stringify({ name }),
        },
      );

      setApiKeys((currentApiKeys) =>
        currentApiKeys.map((apiKey) =>
          apiKey.id === body.apiKey.id ? body.apiKey : apiKey,
        ),
      );
      handleCancelEditing();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update API key.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const body = await requestJson<ApiKeyResponse>(`/api/api-keys/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "revoked" }),
      });

      setApiKeys((currentApiKeys) =>
        currentApiKeys.map((apiKey) =>
          apiKey.id === body.apiKey.id ? body.apiKey : apiKey,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to revoke API key.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    const shouldDelete = window.confirm(
      "Delete this API key? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        throw new Error(body?.error ?? "Unable to delete API key.");
      }

      setApiKeys((currentApiKeys) =>
        currentApiKeys.filter((apiKey) => apiKey.id !== id),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete API key.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-medium">API Keys</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {activeKeyCount} active of {apiKeys.length} total keys.
          </p>
        </div>

        <form
          className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row"
          onSubmit={handleCreateApiKey}
        >
          <label className="sr-only" htmlFor="api-key-name">
            API key name
          </label>
          <input
            className="h-10 flex-1 rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
            id="api-key-name"
            onChange={(event) => setNewKeyName(event.target.value)}
            placeholder="API key name"
            value={newKeyName}
          />
          <button
            className="h-10 rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            disabled={isSaving}
            type="submit"
          >
            Create API Key
          </button>
        </form>
      </div>

      {newSecret ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">Copy this key now. It will not be shown again.</p>
          <p className="mt-2 break-all font-mono">{newSecret}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : null}

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
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={5}>
                  Loading API keys...
                </td>
              </tr>
            ) : null}

            {!isLoading && apiKeys.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={5}>
                  No API keys yet. Create your first key to get started.
                </td>
              </tr>
            ) : null}

            {apiKeys.map((apiKey) => {
              const isEditing = editingId === apiKey.id;

              return (
                <tr
                  className="border-t border-zinc-200 dark:border-zinc-800"
                  key={apiKey.id}
                >
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <form
                        className="flex gap-2"
                        id={`edit-api-key-${apiKey.id}`}
                        onSubmit={handleUpdateApiKey}
                      >
                        <label className="sr-only" htmlFor={`name-${apiKey.id}`}>
                          API key name
                        </label>
                        <input
                          className="h-9 min-w-40 rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
                          id={`name-${apiKey.id}`}
                          onChange={(event) => setEditingName(event.target.value)}
                          value={editingName}
                        />
                      </form>
                    ) : (
                      apiKey.name
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">{apiKey.maskedKey}</td>
                  <td className="px-4 py-3">{formatDate(apiKey.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(apiKey.status)}`}
                    >
                      {apiKey.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <>
                        <button
                          className="mr-3 text-zinc-600 transition-colors hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:text-zinc-50"
                          disabled={isSaving}
                          form={`edit-api-key-${apiKey.id}`}
                          type="submit"
                        >
                          Save
                        </button>
                        <button
                          className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                          onClick={handleCancelEditing}
                          type="button"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="mr-3 text-zinc-600 transition-colors hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:text-zinc-50"
                          disabled={isSaving}
                          onClick={() => handleStartEditing(apiKey)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="mr-3 text-amber-600 transition-colors hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-400 dark:hover:text-amber-300"
                          disabled={isSaving || apiKey.status === "revoked"}
                          onClick={() => void handleRevokeApiKey(apiKey.id)}
                          type="button"
                        >
                          Revoke
                        </button>
                        <button
                          className="text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
                          disabled={isSaving}
                          onClick={() => void handleDeleteApiKey(apiKey.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
