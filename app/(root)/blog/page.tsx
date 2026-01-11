import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'


const POST_PER_PAGE = 10
const BLOGS_QUERY = `
  query allPosts($first: Int, $after: String, $last: Int, $before: String ) {
    posts( first: $first, after: $after, last: $last, before: $before ) {
      nodes {
        title
        slug
        date
        excerpt
        featuredImage{
          node{
            slug
            sourceUrl
          }
        }




      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`

/*
async function getBlogsData(before?:string, after?:string) {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: BLOGS_QUERY, variables: {
      before,after
    }, },),
  })

  const json = await res.json()
  console.log("JSON data:", JSON.stringify(json, null,2))
  // return json.data.pageBy.homePageFields
  return json.data?.posts?.nodes || null
}
*/

async function getBlogsData({ after, before }: { after?: string; before?: string }) {
  const isPrev = Boolean(before)

  const variables = isPrev ? { last: POST_PER_PAGE, before } : { first: POST_PER_PAGE, after }

  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: BLOGS_QUERY,
      variables,
    }),
    //next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error("GraphQL request failed")
  }

  const json = await res.json()
  return json.data.posts
}



/*
const BlogPage = async() => {

  const blogsData = await getBlogsData("","YXJyYXljb25uZWN0aW9uOjExNg==")

  console.log("blogsData", blogsData)



  return (
    <>
      <h1>Hero section will be here...</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsData.map((post:any,idx:number) => (
            <Card key={post.id} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={idx * 100} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <User className="w-4 h-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700 mb-4">
                  {post.excerpt}
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                  <Link href={`/blog/${post.slug}`} className="flex items-center">
                    আরও পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>    
    </>
  )
}
*/

const BlogPage = async ({
  searchParams,
}: {
  searchParams?: { after?: string; before?: string }
}) => {

  const params = await searchParams
  const after = params?.after || undefined
  const before = params?.before || undefined
  const posts = await getBlogsData({ after, before })

  // console.log("Posts",JSON.stringify(posts, null, 10) )

  return (
    <>
      <section className='bg-cover bg-center bg-no-repeat' style={{ backgroundImage: `url('/images/BlogBG.png')` }}>
        <div className="container bg-linear-to-r from-black/70 via-black/50 to-transparent">


          <h1 className='text-center py-24 md:py-40 text-3xl md:text-5xl text-white'>আমাদের ব্লগ</h1>
        </div>
      </section>


      <section className='py-20'>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.nodes.map((post: any, idx: number) => (
              <Card key={post.slug} className="h-full py-0 pb-6">
                <div className="relative h-48 overflow-hidden">
                  {post.featuredImage?.node?.sourceUrl ? (<Image 
                    src={post.featuredImage?.node?.sourceUrl} 
                    alt={post.title}
                    fill
                    className="object-cover w-full h-full"
                  />) : ""}
                  
                </div>




                <CardHeader>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(post.date).toLocaleString("en-US", {
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
                  
                  <CardTitle>{post.title}</CardTitle>
                  <p>
                  </p>                

                </CardHeader>
                <CardContent>
                  
                    {/* {post.excerpt} */}
                    <div
                      className="prose text-gray-700 mb-4"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  
                  <Button asChild  className="px-4 py-2 bg-green-600 text-white h-auto ">
                    <Link href={`/blog/${post.slug}`} className="flex items-center">
                      বিস্তারিত পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      

      

      {/* Pagination */}
      {/* <div className="flex justify-between mt-10">
        {posts.pageInfo.hasPreviousPage ? (
          <Link
            href={`?before=${posts.pageInfo.startCursor}`}
            className="underline"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}

        {posts.pageInfo.hasNextPage && (
          <Link
            href={`?after=${posts.pageInfo.endCursor}`}
            className="underline"
          >
            Next →
          </Link>
        )}
      </div> */}


<div className="flex justify-between mt-10">
  {posts.pageInfo.hasPreviousPage ? (
    <Button asChild variant="outline">
      <Link href={`?before=${posts.pageInfo.startCursor}`}>← Previous</Link>
    </Button>
  ) : (
    <span />
  )}

  {posts.pageInfo.hasNextPage ? (
    <Button asChild variant="outline">
      <Link href={`?after=${posts.pageInfo.endCursor}`}>Next →</Link>
    </Button>
  ) : (
    <span />
  )}
</div>


    </>
  )
}




export default BlogPage