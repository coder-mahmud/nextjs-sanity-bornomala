import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache"; // IMPORTANT: correct import

export async function POST(req: NextRequest) {
  const body = await req.json();
  // console.log("Validate body:", body);

  // Secret check
  if (body.secret !== process.env.NEXT_PUBLIC_REVALIDATE_TOKEN) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    // Revalidate homepage
    await revalidatePath("/");

    // Revalidate dynamic blog post if slug provided
    if (body.postSlug) {
      await revalidatePath(`/blog/${body.postSlug}`);
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ message: "Error revalidating", err }, { status: 500 });
  }
}
