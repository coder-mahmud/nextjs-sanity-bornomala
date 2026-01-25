import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'

// export const dynamic = "force-dynamic";


type Blog = {
  title: string;
  content: string;
  slug: string;
  date:string
  featuredImage?:{
    node:{
      sourceUrl:string
    }
  }

  acfCourses?: {
    duration?: string;
    level?: string;
    price?: string;
  };
};

async function getBlogPost(slug:string): Promise<Blog | null> {
  
  
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query postBySlug($slug: String!) {
          postBy(slug: $slug) {
            title
            content
            date
            featuredImage {
              node {
                sourceUrl
                
              }
            }
          }
        }



      `,
      variables: {
        slug,
      },
    }),
    //next: { revalidate: 60 }, // ISR
  });

  if (!res.ok) {
    throw new Error("GraphQL request failed")
  }

  const json = await res.json();
  // console.log("Page data:", JSON.stringify(json, null, 2));
  // console.log("getCourse data:", json);


  return json?.data?.postBy ?? null;
}



export async function generateStaticParams() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query allPosts {
          posts(first: 100) {
            edges {
              node {
                slug
              }
            }
          }
        }
      `,
    }),
  });

  const json = await res.json();

  // console.log("Post Json", JSON.stringify(json, null, 2));

  return json.data.posts.edges.map(
    (post: { node: { slug: string } }) => ({
      slug: [post.node.slug],
    })
  );
}

  



export default async function CoursePage({params}: { params: { slug: string }}) {
  const paramList = await params
  // console.log("paramList", paramList)
  const blog = await getBlogPost(paramList.slug[0]);
  // const course = null
  // console.log("Course Data:", blog)



  // console.log("thisCourseSchedules",JSON.stringify(thisCourseSchedules, null, 2))


  if (!blog) {
    return <h1>Blog not found</h1>;
  }

  return (
    <>

      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="blog_hero_section py-10">
        {/* <div className="bg_image absolute z-10 top-0 left-0 w-full h-full bg-green-500 overflow-hidden">
          
          
          
        </div> */}
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="container relative h-full">
          
            <div className="flex flex-col items-center">

              {
                blog?.featuredImage?.node?.sourceUrl ? (
                  <Image src={blog.featuredImage.node.sourceUrl} width={500} height={150} alt={blog.title} className="w-[400px] h-auto object-contain block mx-auto rounded-2xl" />
                ) : ''
              }



              <h1 className="text-3xl md:text-5xl mt-4 mb-2">{blog.title}</h1>

              <div className="flex items-center text-gray-600 mb-2 text-xl">
                <Calendar className="w-6 h-6 mr-1" />
                <span>{new Date(blog.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  // hour: "2-digit",
                  // minute: "2-digit",
                })}</span>
                {/* <span className="mx-2">•</span>
                <User className="w-4 h-4 mr-1" />
                <span>{post.author}</span> */}
              </div> 



            </div>

          
        </div>
      </section>

      <section data-aos="fade-up" data-aos-offset="100" data-aos-duration="1000" data-aos-delay="0" className="py-20">
        <div className="container">
        <div
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
          
        </div>
      </section>


    </>
  );
}
