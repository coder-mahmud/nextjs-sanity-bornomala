import Image from "next/image";
import HomeHero from "@/components/home/HomeHero"
import FeaturesSection from "@/components/home/Features";
import TestimonialsSection from "@/components/home/Testimonial";
import CoursesSection from "@/components/home/Courses";
import WhyChooseUsSection from "@/components/home/WhyChooseUs";
import ContactSection from "@/components/home/ContactUsSection";
import ScheduleSection from "@/components/home/Schedule";
import FAQSection from "@/components/home/Faq";
import BlogSection from "@/components/home/BlogSection";
import ScheduleSectionNew from "@/components/home/ScheduleNew";


const HOME_QUERY = `
  query HomePage {
    pageBy(uri: "/home") {
    title
		homePageFields{
      numberOfStudents
      successRate
      certifiedStudents
      testimonials {
        name
        testimonialText
        rating
        image {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
}
`

async function getHomeData() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: HOME_QUERY }),
    // next: { revalidate: 60 }, // ISR
    // cache: "no-store",
  })

  const json = await res.json()
  // console.log("JSON data:", json)
  return json.data.pageBy.homePageFields
}





export default async function Home() {
  const homeData = await getHomeData()
  const numberOfStudents = homeData.numberOfStudents
  const successRate = homeData.successRate
  const certifiedStudents = homeData.certifiedStudents
  const testimonials = homeData.testimonials

  return (
    <>
      <HomeHero data={{numberOfStudents,successRate, certifiedStudents}} />
      <FeaturesSection />
      <TestimonialsSection testimonials={testimonials} />
      <CoursesSection />
      <WhyChooseUsSection />
      {/* <ScheduleSection /> */}
      <ScheduleSectionNew />
      <ContactSection />
      <FAQSection />
      <BlogSection />

    </>
  );
}
