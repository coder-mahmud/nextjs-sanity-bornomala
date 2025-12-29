import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {

  console.log("/api/revalidate path accessed!")
  let body;

  try {
    body = await req.json();
    console.log("Body Data:", body)
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    );
  }

  try {
    revalidatePath("/");

    if (body.postSlug) {
      revalidatePath(`/blog/${body.postSlug}`);
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
