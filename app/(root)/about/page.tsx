import Link from 'next/link';
import Image from 'next/image';

const ABOUT_QUERY = `
 query PageBySlug {
  pageBy(uri: "/about"){
    title
    aboutPageFields{
      heroTitle
      heroDescription
      purposeTitle
      purposeDescription
      whyEchole{
        title
        description
      }
      howWeTeach{
        title
        description
      }
      courseTargetAreaTitle
      courseTarget
      courseTargetText
      philosophyTitle
      philosophyDescription
      teachers{
        image {
          node {
            sourceUrl
          }
        }
        title
        subTitle
        description
      }
      
    }
  }
}
`

async function getAboutData() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: ABOUT_QUERY }),
    // next: { revalidate: 60 }, // ISR
    // cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("GraphQL request for getHomeData failed")
  }

  const json = await res.json()
  // console.log("JSON data:", json)

  if (!json?.data?.pageBy?.aboutPageFields) {
    return null
  }
  return json.data.pageBy.aboutPageFields
}





export default async function AboutPage() {

  const aboutData = await getAboutData()
  // console.log("About Data:", aboutData)

  return (
    <main className="">


      {/* Hero Section */}
      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center py-20 px-4 sm:px-6 lg:px-8  mx-auto bg-primary-gradient">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight max-w-[550px] mx-auto">
            {aboutData.heroTitle}
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {aboutData.heroDescription}
          </p>
          <button className="mt-10 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Link href="/contact">বিনামূল্যে পরামর্শ বুক করুন</Link>
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section data-aos="fade-up" data-aos-offset="100" data-aos-duration="1000" data-aos-delay="0" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold  mb-4">{aboutData.purposeTitle}</h2>
          <p className="text-2xl text-gray-800 font-light italic leading-relaxed">
            {aboutData.purposeDescription}
          </p>
        </div>
      </section>

      <section className="bg-primary-gradient py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="text-3xl font-bold text-center mb-6">
          কেন École Bornomala ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            { aboutData.whyEchole.map((item:any, i:number) => (
              <div  data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={100*i} key={i} className="rounded-2xl border p-6 text-center hover:shadow-lg transition" >
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className=" py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="text-3xl font-bold text-center mb-12">
            আমরা যেভাবে শেখাই
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {aboutData.howWeTeach.map((step:any, i:number) => (
              <div
                data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={100*i}
                key={i}
                className="bg-white rounded-xl p-6 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-blue-600 mb-3">
                  {step.title}
                </div>
                <p className="font-medium">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-aos="fade-up" data-aos-offset="100" data-aos-duration="1000" data-aos-delay="0" className="bg-primary-gradient py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            {aboutData.courseTargetAreaTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            

            <div
              dangerouslySetInnerHTML={{
                __html: aboutData.courseTarget,
              }}
            />

            <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-8">
              <p className="text-lg font-medium">
                {aboutData.courseTargetText}
              </p>
            </div>
          </div>
        </div>
      </section>


      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
          {aboutData.philosophyTitle}
          </h2>

          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
          {aboutData.philosophyDescription}
          </p>
        </div>
      </section>



      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-primary-gradient py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            আজই আপনার French Learning Journey শুরু করুন
          </h2>
          <p className="mb-8 ">
            একটি ফ্রি কাউন্সেলিং সেশন বুক করে জানুন আপনার জন্য
            কোন কোর্সটি সবচেয়ে উপযুক্ত।
          </p>

          <button className="mt-10 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Link href="/contact">বিনামূল্যে পরামর্শ বুক করুন</Link>
          </button>
        </div>
      </section>





      {/* Team Section */}
      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">বর্ণমালার টিচার্স প্যানেল</h2>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-8 justify-center">
            
          {aboutData.teachers.map((teacher:any,idx:number) => (
            <div key={idx} className="text-center max-w-[540px] mx-auto">
            
            {teacher?.image?.node?.sourceUrl && <Image
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              src={teacher?.image?.node?.sourceUrl} width={300} height={300}
              alt={teacher.title}
            /> }
            
            <h3 className="text-xl font-semibold text-gray-900">{teacher.title}</h3>
            <p className=" font-medium">{teacher.subTitle}</p>
            <p className="mt-3 text-gray-600 ">
              {teacher.description}
            </p>
            </div>
          ))}
            
            


           
            {/* <div className="text-center">
              <img
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                src="https://i.pravatar.cc/150?img=32" // Placeholder image
                alt="রোহনের ছবি"
              />
              <h3 className="text-xl font-semibold text-gray-900">রোহন</h3>
              <p className=" font-medium">Co founder and Teacher</p>
              <p className="mt-3 text-gray-600 text-sm">
                মনোমুগ্ধকর শিক্ষামূলক অ্যাপ তৈরির অভিজ্ঞতা নিয়ে, রোহন বর্ণমালার মসৃণ, আন্তঃক্রিয়শীল এবং ব্যবহারকারী-বান্ধব অভিজ্ঞতার রূপকার।
              </p>
            </div> */}



          </div>
        </div>
      </section>

      {/* CTA / Community Section */}
      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-primary-gradient py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold  mb-4">
            আমাদের কমিউনিটিতে যোগ দিন
          </h2>
          <p className="text-xl mb-8">
            শেখা একটি ভাগ করে নেওয়ার অভিযান। বর্ণমালা পরিবারের অংশ হোন এবং বাংলা ভাষার সাথে আপনার নিজের গল্প লেখা শুরু করুন।
          </p>
            <button className="mt-10 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <a href="https://www.facebook.com/dailyfrenchbybornomala/"> আমাদের ফেসবুকে যোগ দিন</a>
            </button>          
        </div>
      </section>
    </main>
  );
}