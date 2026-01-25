import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {

  console.log("/api/revalidate path accessed!")
  let body;

  try {
    body = await req.json();
    console.log("Body Data:", body)
    // console.log("Body secret:", body.secret);
    // console.log("ENV secret:", process.env.REVALIDATE_SECRET);
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
    revalidatePath("/about");
    revalidatePath("/contact");

    if (body.postSlug) {
      revalidatePath(`/blog/${body.postSlug}`);
    }

    if(body.postType === 'post'){
      revalidatePath("/blog");
      revalidatePath(`/blog/${body.postSlug}`);

      const totalPages = Math.ceil(body.totalPosts / 12)

      for (let i = 1; i <= totalPages; i++) {
        console.log("revalidatingPath", `/blog/page/${i}`)
        revalidatePath(`/blog/page/${i}`);
      }

    }

    // if(body.postType === 'class-schedule'){
    //   revalidatePath("/blog");
    //   revalidatePath(`/blog/${body.postSlug}`);
    // }

    if(body.postType === 'courses'){
      revalidatePath("/courses");
      revalidatePath(`/courses/${body.postSlug}`);
    }

    if(body.postType === 'result'){
      revalidatePath("/results");
      revalidatePath(`/results/${body.postSlug}`);

      const totalPages = Math.ceil(body.totalResults / 12)

      for (let i = 1; i <= totalPages; i++) {
        console.log("revalidatingPath", `/blog/page/${i}`)
        revalidatePath(`/results/page/${i}`);
      }


    }


    if(body.postType === 'success-story'){
      revalidatePath("/success-stories");
      revalidatePath(`/success-stories/${body.postSlug}`);
      
      const totalPages = Math.ceil(body.total_sstories / 12)

      for (let i = 1; i <= totalPages; i++) {
        console.log("revalidatingPath", `/blog/page/${i}`)
        revalidatePath(`/success-stories/page/${i}`);
      }
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
