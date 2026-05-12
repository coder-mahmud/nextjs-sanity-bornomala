import Image from "next/image";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

type Blog = {
  title: string;
  content: string;
  slug: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
};

async function getBlogPost(slug: string): Promise<Blog | null> {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query postBySlug($slug: String!) {
          successStoryBy(slug: $slug) {
            title
            content
            date
            slug
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      `,
      variables: { slug },
    }),
    // next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("GraphQL request failed");
  }

  const json = await res.json();
  return json?.data?.successStoryBy ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<Metadata> {
  const { slug } = await params;
  const currentSlug = slug[0];
  const blog = await getBlogPost(currentSlug);

  const pageUrl = `https://ecolebornomala.com/success-stories/${currentSlug}`;
  const imageUrl = blog?.featuredImage?.node?.sourceUrl || "https://ecolebornomala.com/default-og.jpg";

  if (!blog) {
    return {
      title: "Success Story Not Found",
      description: "This success story could not be found.",
    };
  }

  return {
    metadataBase: new URL("https://ecolebornomala.com"),
    title: blog.title,
    description: `${blog.title} - Success story from Ecole Bornomala`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: blog.title,
      description: `${blog.title} - Success story from Ecole Bornomala`,
      url: pageUrl,
      siteName: "Ecole Bornomala",
      type: "article",
      publishedTime: blog.date,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: `${blog.title} - Success story from Ecole Bornomala`,
      images: [imageUrl],
    },
  };
}

export default async function CoursePage(
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const blog = await getBlogPost(slug[0]);

  if (!blog) {
    return <h1>Success story not found</h1>;
  }

  return (
    <>
      <section className="blog_hero_section py-10">
        <div className="container relative h-full">
          <div className="flex flex-col items-center">
            {blog?.featuredImage?.node?.sourceUrl ? (
              <Image
                src={blog.featuredImage.node.sourceUrl}
                width={500}
                height={150}
                alt={blog.title}
                className="w-[400px] h-auto object-contain block mx-auto rounded-2xl"
              />
            ) : null}

            <h1 className="text-3xl md:text-5xl mt-6 max-w-5xl mb-2 text-center">
              {blog.title}
            </h1>

            <div className="flex items-center text-gray-600 mb-2 text-xl">
              <Calendar className="w-6 h-6 mr-1" />
              <span>
                {new Date(blog.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-20">
        <div className="container">
          <div
            className="wp-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </section>
    </>
  );
}