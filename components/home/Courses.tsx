import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Star, BookOpen } from 'lucide-react'
import Link from 'next/link'

const COURSES_QUERY = `
  query allCourses {
    allCourses(where: {orderby: {field: DATE, order: ASC}}) {
      nodes {
        title
        slug
        coursesFields {
          characteristics
          duration
          numberOfStudents
          rating
          shortDescription
          type
        }
      }
    }
  }
`

async function getCoursesData() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: COURSES_QUERY }),
    // next: { revalidate: 60 }, // ISR
    // cache: "no-store",
  })

  const json = await res.json()
  // console.log("JSON data:", json)
  // return json.data.pageBy.homePageFields
  return json.data.allCourses.nodes
}





const CoursesSection = async () => {


  const courseData = await getCoursesData()
  // console.log("Course Data:", courseData)



  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            আমাদের কোর্সসমূহ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আপনার প্রয়োজন অনুযায়ী কোর্স নির্বাচন করুন
          </h2>
          <p className="text-lg text-gray-700">
            বিগিনার থেকে অ্যাডভান্সড লেভেল পর্যন্ত বিভিন্ন কোর্স যা আপনার লক্ষ্য অর্জনে সাহায্য করবে
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-center">
          
          {courseData.map((course:any,idx:number) => (
            <Card key={idx} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={idx*100} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {course.title}
                  </CardTitle>
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded">
                    {course.coursesFields.type}
                  </span>
                </div>
                <CardDescription className="text-gray-700 text-base">
                  {course.coursesFields.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>সময়কাল: {course.coursesFields.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    <span>শিক্ষার্থী: {course.coursesFields.numberOfStudents}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-primary" />
                    <span>রেটিং: {course.coursesFields.rating}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">কোর্সের বৈশিষ্ট্য:</h4>
                  <span className="rich_text"
                    dangerouslySetInnerHTML={{
                      __html: course.coursesFields.characteristics
                    }}
                  />
                </div>
              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/courses/${course.slug}`}>
                    বিস্তারিত দেখুন
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="mt-16 text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            সকল কোর্সের জন্য বিনামূল্যে পরামর্শ
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            কোন কোর্সটি আপনার জন্য উপযুক্ত?
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            আমাদের বিশেষজ্ঞ টিউটররা আপনার প্রয়োজন অনুযায়ী সঠিক কোর্স নির্বাচনে সাহায্য করবেন।
          </p>
          <Button asChild size="lg" className="px-8 py-3">
            <a href="/#contact_section">
              পরামর্শের জন্য যোগাযোগ করুন
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CoursesSection