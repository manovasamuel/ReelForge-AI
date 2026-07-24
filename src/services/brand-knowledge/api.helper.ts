import { NextResponse } from "next/server";
import { BrandKnowledgeError, ValidationError, AuthorizationError, StorageError, RepositoryError } from "./errors";

export function handleBrandKnowledgeError(error: unknown) {
  console.error("[BrandKnowledgeAPI] Error:", error);

  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof StorageError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  if (error instanceof RepositoryError) {
    // If it's a "not found" type of error masked as repository error
    if (error.message.toLowerCase().includes("not found")) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Database Error" }, { status: 500 });
  }

  if (error instanceof BrandKnowledgeError) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
