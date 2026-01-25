import Pagination from '@/components/Pagination';
import Link from 'next/link';
import React from 'react'
import Image from 'next/image';
import ResultsHero from '@/components/others/ResultsHero';

const POSTS_PER_PAGE = 10

const RESULTS_QUERY = `
  query AllResults( $size: Int!) {
    results(first: $size) {
      edges {
        node {
          title
          slug
          excerpt
          featuredImage{
            node{
              sourceUrl
            }
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
`;




async function getResultsData(page: number) {
  // const offset = (page - 1) * POSTS_PER_PAGE;

  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: RESULTS_QUERY,
      variables: {
        size: POSTS_PER_PAGE,
      },
    }),
    // cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("GraphQL request for results failed")
  }

  const json = await res.json();

  // console.log("Results Data:", JSON.stringify(json,null, 10))

  return {
    results: json.data.results.edges,
    total: json.data.results.pageInfo.offsetPagination.total,
  };
}






const ResultsPage = async({params}: { params: { page: string }}) => {

  // const paramsData = await params
  const currentPage =  1;
  // console.log("Current Page:", currentPage)
  const { results, total } = await getResultsData(currentPage);
  // console.log("Results Page data:", JSON.stringify(results, null,10))
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  // console.log("Total Page:", totalPages)


  return (
    <>

      <ResultsHero />

      <section>
        <div className="container py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(({ node }: any, index: number) => (
              <div  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={index*100} key={index} className="single_result border rounded  flex justify-start flex-col">
                {node.featuredImage? (
                  <Image className='w-full h-auto' src={node.featuredImage.node.sourceUrl} alt={node.title} width={300} height={300} />
                ) : ""}

                <div className="short_info p-3">
                  <h2 className="text-xl mb-4 text-center">
                    {node.title}
                  </h2>
                  <Link className='block px-2 py-1 rounded bg-green-500 cursor-pointer text-white hover:bg-green-900 text-center' href={`/results/${node.slug}`}>See Result</Link>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>


      </section>





    </>
  )
}

export default ResultsPage