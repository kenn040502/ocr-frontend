// app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const backendRes = await fetch(
    `${process.env.BACKEND_URL}/extract`,
    { method: "POST", body: formData }
  );

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  return NextResponse.json(data);
}