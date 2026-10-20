import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, CalendarCheck, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Schedule, Branch, ScheduleEntry } from '@/prisma/generated/prisma/client'

// Extended type to include relations safely
type ScheduleWithRelations = Schedule & {
  branch: Branch | null;
  entries: ScheduleEntry[];
  parisCourses: { title: string }[];
  hocheCourses: { title: string }[];
};

async function getSchedulesFromDatabase(): Promise<ScheduleWithRelations[]> {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        branch: true,   
        entries: true,  
        parisCourses: { select: { title: true } },
        hocheCourses: { select: { title: true } },
      },
      orderBy: { createdAt: 'asc' },
    }) as unknown as ScheduleWithRelations[];
    
    return schedules
  } catch (error) {
    console.error("Failed to fetch schedules from database:", error)
    return []
  }
}

const ScheduleSectionPrisma = async () => {
  const schedules = await getSchedulesFromDatabase()

  const getLevelColor = (level: string | null) => {
    if (!level) return "bg-gray-100 text-gray-800"
    if (level.includes("Beginner")) return "bg-green-100 text-green-800"
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
          {schedules.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 text-sm">
              কোনো ক্লাস সময়সূচী পাওয়া যায়নি।
            </div>
          ) : (
            schedules.map((schedule) => {
              const courseName = schedule.parisCourses?.[0]?.title || schedule.hocheCourses?.[0]?.title;

              return (
                <Card 
                  key={schedule.id} 
                  data-aos="fade-up" 
                  data-aos-offset="0" 
                  data-aos-duration="1000" 
                  data-aos-delay="100" 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                >
                  <CardHeader className="pb-4">

                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {courseName ? `${courseName}` : "Class Schedule"}
                        <div className='flex gap-1 items-center text-sm font-normal text-gray-600 mt-1'>
                          <MapPin className="w-4 h-4 mr-0 text-primary" /> Campus: {schedule.branch?.name || "N/A"}
                        </div>
                      </CardTitle>
                      {schedule.tag ? (
                        <Badge className={getLevelColor(schedule.tag)}>
                          {schedule.tag}
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription className="text-gray-700">
                      {schedule.description || "নিয়মিত ব্যাচের ক্লাস সময়সূচী।"}
                    </CardDescription>
                  </CardHeader>
                                
                  <CardContent className="grow space-y-4">
                    {schedule.entries && schedule.entries.length > 0 ? (
                      schedule.entries.map((entry) => (
                        <div key={entry.id} className="space-y-3 border rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center text-sm text-gray-700 font-semibold">
                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                            <span>{entry.day}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            <span>{entry.time}</span>
                          </div>
                          
                          {entry.startingDate && (
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                              <span>{entry.startingDate}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No schedule days defined.</p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScheduleSectionPrisma