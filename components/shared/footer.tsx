import React from 'react'
import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { subsCribeAction } from '@/actions/form'
import Subscribe from './Subscribe'
import FloatingContact from './FloatingContacts'

const OPTIONS_QUERY = `
  query SiteOptions {
    siteOptions {
      globalOptions {
        address
        contactTimes
        emails
        footerPhoneNumber
        footerShortDescription
        facebookLink
        youtubeLink
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









const Footer = async () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: "হোম", href: "/" },
    { name: "আমাদের সম্পর্কে", href: "/about" },
    { name: "কোর্সসমূহ", href: "/courses" },
    { name: "ব্লগ", href: "/blog" },
    { name: "যোগাযোগ", href: "/contact" },
    { name: "ফলাফল", href: "/results" },
    // { name: "DELF পরীক্ষা", href: "/exam" }
  ]



  const siteOptions = await getSiteOpions();
  // console.log("siteOptions",siteOptions)

  return (

    <>

      <Subscribe />






    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Link href="/">
                <Image src="/images/LogoWhite.png" alt="Logo" width={120} height={120} className="w-auto h-12" />
              </Link>
            </div>
            <p className="text-white mb-6">
              {siteOptions.footerShortDescription}
            </p>
            <div className="flex space-x-4">
            
              <a href={siteOptions.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-2 rounded-full transition-colors duration-300"
                aria-label='Facebook Link'
              >
                {<Facebook className="h-5 w-5" />}
              </a>
              <a href={siteOptions.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-2 rounded-full transition-colors duration-300"
                aria-label='YouTube Link'
              >
                {<Youtube className="h-5 w-5" />}
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100">
            <h3 className="text-lg font-bold mb-4">গুরুত্বপূর্ণ লিংক</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-white hover:text-gray-200 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="200" className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">যোগাযোগের তথ্য</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <div className="mr-3 mt-1">
                      {<Phone className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">ফোন নম্বর</h4>
                      <ul className="mt-1">
                        
                        <div className="text-white text-sm"
                            dangerouslySetInnerHTML={{
                              __html: siteOptions?.footerPhoneNumber || "",
                            }}
                          />

                      </ul>
                    </div>
                  </div>
                </div>                
                
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <div className="mr-3 mt-1">
                      {<Mail className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">ইমেল ঠিকানা</h4>
                      <ul className="mt-1">
                        
                        <div className="text-white text-sm"
                            dangerouslySetInnerHTML={{
                              __html: siteOptions?.emails || "",
                            }}
                          />

                      </ul>
                    </div>
                  </div>
                </div>         
                
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <div className="mr-3 mt-1">
                      {<MapPin className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">ঠিকানা</h4>
                      <ul className="mt-1">
                        
                        <div className="text-white text-sm"
                            dangerouslySetInnerHTML={{
                              __html: siteOptions?.address || "",
                            }}
                          />

                      </ul>
                    </div>
                  </div>
                </div>                
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <div className="mr-3 mt-1">
                      {<Clock className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">সময়সূচী</h4>
                      <ul className="mt-1">
                        
                        <div className="text-white text-sm"
                            dangerouslySetInnerHTML={{
                              __html: siteOptions?.contactTimes || "",
                            }}
                          />

                      </ul>
                    </div>
                  </div>
                </div>


{/*               
              {contactInfo.map((info, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-start mb-2">
                    <div className="mr-3 mt-1">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{info.title}</h4>
                      <ul className="mt-1">
                        {info.details.map((detail, idx) => (
                          <li key={idx} className="text-white text-sm">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))} */}


            </div>
          </div>
        </div>



        {/* Copyright */}
        <div  className="pt-8 border-t border-gray-800 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className=" text-sm mb-4 md:mb-0">
              © {currentYear} বর্ণমালা ফরাসি ভাষা স্কুল। সর্বস্বত্ব সংরক্ষিত।
            </p>

            {/* <div className="flex space-x-6">
              <Link href="/privacy-policy" className=" hover:text-primary text-sm transition-colors duration-300">
                গোপনীয়তা নীতি
              </Link>
              <Link href="/terms-conditions" className=" hover:text-primary text-sm transition-colors duration-300">
                শর্তাবলী
              </Link>
            </div> */}


          </div>
        </div>
        
        {/* <div className="developer_link">
          <div className="">
            <p className='text-sm text-center'>Website Developed By: <a href="https://codermahmud.xyz">Mahmud</a></p>
          </div>
        </div> */}


      </div>
    </footer>

    <FloatingContact />
    </>
  )
}

export default Footer