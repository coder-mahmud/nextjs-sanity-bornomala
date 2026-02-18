import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

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


  if (!json.data?.siteOptions?.globalOptions) {
    return null
  }
  return json.data.siteOptions.globalOptions
}




const ContactSection = async () => {

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "ফোন নম্বর",
      details: [
        "Paris 18: +33 7 53 30 18 75",
        "Pantin Hoche: 07 56 99 90 85"
      ]
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "ইমেল",
      details: [
        "contact.ecolebornomala@gmail.com ",
      ]
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "ঠিকানা",
      details: [
        "প্যারিস ক্যাম্পাস: 135 rue du mont Cenis 75018 Paris",
        "প্যান্টিন ক্যাম্পাস: 1 rue du pré saint Gervais 93500 Pantin "
      ]
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "সময়সূচী",
      details: [
        "সোমবার - শুক্রবার: সকাল ৯টা - রাত ৮টা",
        "শনিবার - রবিবার: সকাল ১০টা - সন্ধ্যা ৬টা"
      ]
    }
  ]

  const options = await getSiteOpions()
  // console.log("Options", options)

  return (
    <section id="contact_section" className="py-16 md:py-24 bg-primary-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Mail className="w-4 h-4 mr-2" />
            যোগাযোগ করুন
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের সাথে যোগাযোগ করুন
          </h2>
          <p className="text-lg text-gray-700">
            আপনার প্রশ্ন বা মতামত আমাদের জানান। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className='mx-auto' data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2622.9542371499892!2d2.3467397999999995!3d48.8972093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66ef5436faf3d%3A0xa43e5f1c0edcf3df!2s135%20Rue%20du%20Mont-Cenis%2C%2075018%20Paris%2C%20France!5e0!3m2!1sen!2sbd!4v1765777897260!5m2!1sen!2sbd" width="600" height="450" className="border-0 max-w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>



          </div>

          {/* Contact Information */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="border-0 shadow-lg h-full">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4 ">
                    <div className="mr-4 mt-1">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                      ফোন নম্বর
                      </h3>
                      <div className="space-y-1" dangerouslySetInnerHTML={{__html:options.footerPhoneNumber}} />
                        

                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="border-0 shadow-lg h-full">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4 ">
                    <div className="mr-4 mt-1">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                      ইমেল
                      </h3>
                      <div className="space-y-1 max-w-[90%] break-all" dangerouslySetInnerHTML={{__html:options.emails}}/>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="border-0 shadow-lg h-full">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4 ">
                    <div className="mr-4 mt-1">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                      ঠিকানা
                      </h3>
                      <div className="space-y-1 max-w-[90%]" dangerouslySetInnerHTML={{__html:options.addressCopy ?? ''}}/>
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="border-0 shadow-lg h-full">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4 ">
                    <div className="mr-4 mt-1">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                      সময়সূচী
                      </h3>
                      <div className="space-y-1 max-w-[90%]" dangerouslySetInnerHTML={{__html:options.contactTimes ?? ''}}/>
                    </div>
                  </div>
                </CardContent>
              </Card>








            </div>


          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection