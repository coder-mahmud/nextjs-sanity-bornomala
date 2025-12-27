import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Star, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

const SCHEDULES_QUERY = `
  query allCourses {
    allClassSchedule(where: {orderby: {field: DATE, order: ASC}}) {
      nodes {
        classScheduleFields {
          title
          active
          campus
          days {
            day
            startingDate
            time
          }
          level
          shortDescription
        }
      }
    }
  }
`

async function getSchedulesData() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: SCHEDULES_QUERY }),
    // next: { revalidate: 60 }, // ISR
    // cache: "no-store",
  })

  const json = await res.json()
  // console.log("Schedule data:", json)
  return json.data.allClassSchedule.nodes

}








const ScheduleSectionNew = async() => {

  const sechedulesData = await getSchedulesData();
  // console.log("Schedules:", sechedulesData)



  const getLevelColor = (level:any) => {
    if (level.includes("Beginner") ) return "bg-green-100 text-green-800"
    if (level.includes("Intermediate") || level.includes("B2")) return "bg-blue-100 text-blue-800"
    if (level.includes("Expert") || level.includes("C2")) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

 

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            ক্লাস সময়সূচী
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের ক্লাস সময়সূচী
          </h2>
          <p className="text-lg text-gray-700">
            আমাদের বিভিন্ন ক্যাম্পাসের ক্লাস সময়সূচী দেখুন এবং আপনার সুবিধামতো ক্লাসে যোগ দিন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
            {sechedulesData.map((schedule : any, idx:number) =>(
              <Card key={idx} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100" className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {schedule.classScheduleFields.title}
                    <div className='flex gap-1 items-center text-sm'>
                      <MapPin className="w-4 h-4 mr-0 text-primary" />Campus: {schedule.classScheduleFields.campus}
                    </div>
                    
                  </CardTitle>
                  <Badge className={getLevelColor(schedule.classScheduleFields.level)}>
                    {schedule.classScheduleFields.level}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {schedule.classScheduleFields.shortDescription}
                </CardDescription>
              </CardHeader>
                            
              <CardContent className="grow">
                

                {schedule.classScheduleFields.days.map((day:any,idx:number) => (
                  <div key={idx} className="space-y-4 mb-6 border rounded p-4">

                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{day.day}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{day.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{day.startingDate}</span>
                  </div>

                </div>                  
                ))}
                


                


              </CardContent>
              {/* <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div> */}
            </Card>
            ) )}
            






        </div>

        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="mt-16 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              সফলতার গল্প
              </h3>
              <p className="text-gray-700 mb-6">
              আমাদের সাফল্যের গল্প পড়ুন: অনুপ্রেরণামূলক যাত্রা, সাফল্যের রহস্য এবং অর্জনের গল্প।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-6 py-3" asChild>
                <Link href="success-stories">সফলতার গল্প দেখুন</Link>
                </Button>
                {/* <Button variant="outline" size="lg" className="text-lg px-6 py-3">
                  কোর্স দেখুন
                </Button> */}
              </div>
            </div>
            {/* <div className="md:w-1/3 flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-5xl font-bold text-primary mb-2">২০%</div>
                <div className="text-gray-700 font-medium mb-1">ছাড়</div>
                <div className="text-sm text-gray-600">প্রথম কোর্সের উপর</div>
                <div className="text-xs text-gray-500 mt-2">সীমিত সময়ের জন্য</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScheduleSectionNew