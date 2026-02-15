import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/components/Pagination'
import BlogHero from '@/components/blog/BlogHero'


const POSTS_PER_PAGE = 12

const BLOGS_QUERY = `
  query allPosts( $size: Int!) {
    posts(first: $size) {
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
        offsetPagination {
          total
        }
      }
    }
  }
`

async function getBlogsData(page: number) {
  // const offset = (page - 1) * POSTS_PER_PAGE;
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: BLOGS_QUERY,
      variables: {
        size: POSTS_PER_PAGE,
      },
    }),
    //next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error("GraphQL request failed for blog posts")
  }

  const json = await res.json()
  // console.log("results in query",JSON.stringify(json, null, 10) )
  // console.log("Total Posts",json.data.posts.pageInfo.offsetPagination.total )

  return {
    results: json.data.posts.nodes,
    total: json.data.posts.pageInfo.offsetPagination.total
  };
}



const BlogPage = async ({searchParams}: {searchParams?:  { page: string }}) => {

  // const params = await searchParams
  const currentPage =  1;
  const { results,total } = await getBlogsData(currentPage)
  // console.log("results in body",JSON.stringify(results, null, 10) )
  // console.log("totalPages",totalPages)
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)


  return (
    <>
      <BlogHero />


      <section className='py-20'>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((post: any, idx: number) => (
              <Card  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={idx*100}  key={idx} className="h-full py-0 pb-6">
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
                  </div>                  
                  
                  <CardTitle>{post.title}</CardTitle>
                  <p>
                  </p>                

                </CardHeader>


                <CardContent>
                  
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pogeSlug="blog"
          />



        </div>
      </section>
      


    </>
  )
}




export default BlogPage