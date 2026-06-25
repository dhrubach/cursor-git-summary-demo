import { NextResponse } from "next/server";
import { createApiKey, listApiKeys } from "@/lib/api-keys";

export const dynamic = "force-dynamic";

const parseRequestBody = async (request: Request) => {
	try {
		return await request.json();
	} catch {
		return null;
	}
};

export const GET = () => {
	return NextResponse.json({ apiKeys: listApiKeys() });
};

export const POST = async (request: Request) => {
	const body = await parseRequestBody(request);
	const name = typeof body?.name === "string" ? body.name.trim() : "";

	if (!name) {
		return NextResponse.json(
			{ error: "API key name is required." },
			{ status: 400 },
		);
	}

	const createdApiKey = createApiKey(name);

	return NextResponse.json(createdApiKey, { status: 201 });
};
