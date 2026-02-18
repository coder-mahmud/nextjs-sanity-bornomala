import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ToastContainer, toast } from 'react-toastify';

const OPTIONS_QUERY = `
  query SiteOptions {
    siteOptions {
      globalOptions {
        addressCopy
        contactTimes
        emails
        footerPhoneNumber
        footerShortDescription
        facebookLink
        youtubeLink
        headerLogo{
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
  // return null

  if (!json.data?.siteOptions?.globalOptions) {
    return null
  }
  return json.data.siteOptions.globalOptions
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const siteOptions = await getSiteOpions();
  // console.log("Layout SiteOptions:", siteOptions)
  const headerLogo = siteOptions?.headerLogo?.node?.sourceUrl
  return (
    <div className="flex h-screen flex-col">
      <Header logo={headerLogo} />
      <main className="flex-1 wrapper mt-[50px] md:mt-0">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      
    </div>
  );
}