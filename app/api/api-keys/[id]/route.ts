import { NextResponse } from "next/server";
import {
  type ApiKeyStatus,
  deleteApiKey,
  updateApiKey,
} from "@/lib/api-keys";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = new Set<ApiKeyStatus>(["active", "revoked"]);

const parseRequestBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export const PUT = async (request: Request, context: RouteContext) => {
  const { id } = await context.params;
  const body = await parseRequestBody(request);
  const updates: {
    name?: string;
    status?: ApiKeyStatus;
  } = {};

  if (body?.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "API key name must not be empty." },
        { status: 400 },
      );
    }

    updates.name = name;
  }

  if (body?.status !== undefined) {
    if (!validStatuses.has(body.status)) {
      return NextResponse.json(
        { error: "API key status must be active or revoked." },
        { status: 400 },
      );
    }

    updates.status = body.status;
  }

  if (updates.name === undefined && updates.status === undefined) {
    return NextResponse.json(
      { error: "Provide a name or status to update." },
      { status: 400 },
    );
  }

  const apiKey = updateApiKey(id, updates);

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found." }, { status: 404 });
  }

  return NextResponse.json({ apiKey });
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  const { id } = await context.params;
  const deleted = deleteApiKey(id);

  if (!deleted) {
    return NextResponse.json({ error: "API key not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
};
