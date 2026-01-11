import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import ImageOverlay from "@/components/ImageOverlay";

// export const dynamic = "force-dynamic";


type result = {
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

async function getResultPost(slug:string): Promise<any | null> {
  
  
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query resultBySlug($slug: String!) {
          resultBy(slug: $slug) {
            title
            date
            content
            resultsFields{
              resultsDates{
                date
                resultImage{
                node{
                  sourceUrl
                }
                }
              }
            }
            featuredImage{
              node{
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
    throw new Error("GraphQL request for single result page failed")
  }

  const json = await res.json();
  // console.log("Page data:", JSON.stringify(json, null, 2));
  // console.log("getCourse data:", json);


  return json?.data?.resultBy ?? null;
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
  const result = await getResultPost(paramList.slug[0]);
  // const course = null
  // console.log("Result Data:", JSON.stringify(result, null, 10))



  // console.log("thisCourseSchedules",JSON.stringify(thisCourseSchedules, null, 2))


  if (!result) {
    return <h1>result not found!</h1>;
  }

  return (
    <>

      <section className="result_hero_section py-10">
        
        <div className="container relative h-full">
          
            <div className="flex flex-col items-center">

              {
                result?.featuredImage?.node?.sourceUrl ? (
                  <Image src={result.featuredImage.node.sourceUrl} width={500} height={150} alt={result.title} className="w-[400px] h-auto object-contain block mx-auto rounded-2xl" />
                ) : ''
              }



              <h1 className="text-3xl md:text-5xl mt-8 mb-2">{result.title}</h1>

              <div className="flex items-center text-gray-600 mb-2 text-xl">
                <Calendar className="w-6 h-6 mr-1" />
                <span>{new Date(result.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}</span>
              </div> 



            </div>

          
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
        <div className="max-w-5xl mx-auto"
          dangerouslySetInnerHTML={{ __html: result.content }}
        />
          
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <p className="text-center mb-6">রেজাল্ট দেখতে Date এর উপর ক্লিক করুন:</p>
          <div className="flex flex-wrap gap-6 items-center justify-center">
            {result.resultsFields.resultsDates.map((date:any) => (
              <div className="">
                <ImageOverlay text={date.date} imageUrl={date.resultImage.node.sourceUrl} />
              </div>
            ))}
          </div>
        </div>
      </section>


    </>
  );
}
