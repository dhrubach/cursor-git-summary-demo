import { randomBytes, randomUUID } from "crypto";

export type ApiKeyStatus = "active" | "revoked";

export type ApiKeyRecord = {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  status: ApiKeyStatus;
};

type StoredApiKey = ApiKeyRecord & {
  secret: string;
};

type ApiKeyStoreGlobal = typeof globalThis & {
  __apiKeyStore?: StoredApiKey[];
};

const apiKeyGlobal = globalThis as ApiKeyStoreGlobal;

const getStore = () => {
  apiKeyGlobal.__apiKeyStore ??= [];
  return apiKeyGlobal.__apiKeyStore;
};

const toApiKeyRecord = (apiKey: StoredApiKey): ApiKeyRecord => ({
  id: apiKey.id,
  name: apiKey.name,
  maskedKey: apiKey.maskedKey,
  createdAt: apiKey.createdAt,
  updatedAt: apiKey.updatedAt,
  lastUsedAt: apiKey.lastUsedAt,
  status: apiKey.status,
});

const createSecret = () => `sk_live_${randomBytes(24).toString("base64url")}`;

const maskSecret = (secret: string) => {
  const lastFour = secret.slice(-4);
  return `${secret.slice(0, 8)}...${lastFour}`;
};

export const listApiKeys = () =>
  getStore()
    .map(toApiKeyRecord)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

export const createApiKey = (name: string) => {
  const now = new Date().toISOString();
  const secret = createSecret();
  const apiKey: StoredApiKey = {
    id: randomUUID(),
    name,
    secret,
    maskedKey: maskSecret(secret),
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
    status: "active",
  };

  getStore().push(apiKey);

  return {
    apiKey: toApiKeyRecord(apiKey),
    secret,
  };
};

export const updateApiKey = (
  id: string,
  updates: Partial<Pick<ApiKeyRecord, "name" | "status">>,
) => {
  const apiKey = getStore().find((storedApiKey) => storedApiKey.id === id);

  if (!apiKey) {
    return null;
  }

  if (updates.name !== undefined) {
    apiKey.name = updates.name;
  }

  if (updates.status !== undefined) {
    apiKey.status = updates.status;
  }

  apiKey.updatedAt = new Date().toISOString();

  return toApiKeyRecord(apiKey);
};

export const deleteApiKey = (id: string) => {
  const store = getStore();
  const index = store.findIndex((apiKey) => apiKey.id === id);

  if (index === -1) {
    return false;
  }

  store.splice(index, 1);
  return true;
};
