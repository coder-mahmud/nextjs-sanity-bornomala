import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Download } from 'lucide-react'
import Image from 'next/image'

const ScheduleSection = () => {
  // Sample schedule data - replace with your actual schedules
  const schedules = [
    {
      id: 1,
      title: "সপ্তাহের ক্লাস সময়সূচী - প্যারিস ক্যাম্পাস",
      description: "প্যারিস ক্যাম্পাসের সপ্তাহিক ক্লাসের সময়সূচী",
      image: "/images/schedule-paris.jpg",
      location: "প্যারিস ক্যাম্পাস",
      downloadLink: "/downloads/schedule-paris.pdf"
    },
    {
      id: 2,
      title: "সপ্তাহের ক্লাস সময়সূচী - প্যান্টিন ক্যাম্পাস",
      description: "প্যান্টিন ক্যাম্পাসের সপ্তাহিক ক্লাসের সময়সূচী",
      image: "/images/schedule-pantin.jpg",
      location: "প্যান্টিন ক্যাম্পাস",
      downloadLink: "/downloads/schedule-pantin.pdf"
    },
    {
      id: 3,
      title: "সাপ্তাহিক বিশেষ ক্লাস",
      description: "সাপ্তাহিক বিশেষ ক্লাস এবং কর্মশালার সময়সূচী",
      image: "/images/schedule-special.jpg",
      location: "উভয় ক্যাম্পাস",
      downloadLink: "/downloads/schedule-special.pdf"
    },
    {
      id: 4,
      title: "পরীক্ষার প্রস্তুতি ক্লাস",
      description: "DELF, DALF এবং TEF পরীক্ষার প্রস্তুতি ক্লাসের সময়সূচী",
      image: "/images/schedule-exam.jpg",
      location: "উভয় ক্যাম্পাস",
      downloadLink: "/downloads/schedule-exam.pdf"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src={schedule.image} 
                  alt={schedule.title}
                  fill
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {schedule.title}
                  </h3>
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {schedule.location}
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-6">
                  {schedule.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    <span>সর্বশেষ আপডেট: এই সপ্তাহ</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={schedule.downloadLink} download>
                      <Download className="w-4 h-4 mr-2" />
                      ডাউনলোড
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                ক্লাসে ভর্তি হতে চান?
              </h3>
              <p className="text-gray-700 mb-6">
                আপনার পছন্দের সময়সূচী অনুযায়ী ক্লাসে ভর্তি হতে আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সঠিক কোর্স নির্বাচনে সাহায্য করব।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-6 py-3">
                  <a href="#contact">যোগাযোগ করুন</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-6 py-3">
                  <a href="/courses">কোর্স দেখুন</a>
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="relative bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
                    <div className="text-2xl font-bold text-gray-900 mb-2">নতুন ব্যাচ</div>
                    <div className="text-gray-700">শুরু হচ্ছে ১লা জুলাই</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScheduleSection