import React from 'react'
const OPTIONS_QUERY = `
  query SiteOptions {
    siteOptions {
      globalOptions {
        successPageImage{
          node{
            sourceUrl
          }
        }
      }
    }
  }
`

async function getSiteOpions() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: OPTIONS_QUERY }),
  })

  if (!res.ok) {
    throw new Error("GraphQL request for getHomeData failed")
  }

  const json = await res.json()
  // console.log("Options data:", json)


  if (!json.data.siteOptions.globalOptions) {
    return null
  }
  return json.data.siteOptions.globalOptions
}




const SuccessStoriesHero = async () => {
  const siteOptions = await getSiteOpions();
  const successPageImage = siteOptions?.successPageImage?.node?.sourceUrl
  return (
      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className='bg-cover bg-center bg-no-repeat' style={{ backgroundImage: `url('${successPageImage}')` }}>
        <div className="bg-linear-to-r from-black/70 via-black/50 to-transparent">
          <div className="container">
            <h1 className='text-center py-24 md:py-40 text-3xl md:text-5xl text-white'>সাফল্যের গল্প</h1>
          </div>
        </div>
      </section>
  )
}

export default SuccessStoriesHero