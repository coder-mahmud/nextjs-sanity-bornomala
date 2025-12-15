import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Star, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

const ScheduleSectionNew = () => {
  const schedules = [
    {
      id: 1,
      title: "বিগিনার্স ফরাসি কোর্স",
      level: "A1-A2",
      days: "সোম, বুধ, শুক্র",
      time: "সকাল ১০টা - ১১:৩০টা",
      location: "প্যারিস ক্যাম্পাস",
      instructor: "সোফি মার্টিন",
      capacity: "৮/১০",
      rating: "৪.৮",
      description: "ফরাসি ভাষার ভিত্তি শিখুন। বর্ণমালা, সাধারণ বাক্য, পরিচয় এবং দৈনন্দিন কথোপকথনের জন্য প্রয়োজনীয় শব্দভান্ডার অন্তর্ভুক্ত।"
    },
    {
      id: 2,
      title: "ইন্টারমিডিয়েট ফরাসি কোর্স",
      level: "B1-B2",
      days: "মঙ্গল, বৃহস্পতি, বৃহস্পতি",
      time: "বিকাল ৩টা - ৪:৩০টা",
      location: "প্যান্টিন ক্যাম্পাস",
      instructor: "জঁ-ক্লোদ দুবোয়া",
      capacity: "১০/১২",
      rating: "৪.৯",
      description: "আপনার ফরাসি দক্ষতা উন্নত করুন। জটিল বাক্য গঠন, বিভিন্ন কাল এবং বিষয়ভিত্তিক শব্দভান্ডার শিখুন।"
    },
    {
      id: 3,
      title: "অ্যাডভান্সড ফরাসি কোর্স",
      level: "C1-C2",
      days: "শনি, রবি",
      time: "সকাল ৯টা - দুপুর ১২টা",
      location: "প্যারিস ক্যাম্পাস",
      instructor: "মারি ক্লেয়ার",
      capacity: "৬/৮",
      rating: "৪.৯",
      description: "ফরাসি ভাষায় দক্ষতা অর্জন করুন। উন্নত ব্যাকরণ, সাহিত্যিক বিশ্লেষণ এবং পেশাদার যোগাযোগের কৌশল শিখুন।"
    },
    {
      id: 4,
      title: "DELF পরীক্ষার প্রস্তুতি",
      level: "A1-B2",
      days: "সোম, বুধ, শুক্র",
      time: "সন্ধ্যা ৬টা - ৮টা",
      location: "প্যান্টিন ক্যাম্পাস",
      instructor: "পিয়ের লুই",
      capacity: "১২/১৫",
      rating: "৪.৮",
      description: "DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।"
    },
    {
      id: 5,
      title: "ব্যবসায়িক ফরাসি",
      level: "B1-C1",
      days: "মঙ্গল, বৃহস্পতি",
      time: "বিকাল ৫টা - ৬:৩০টা",
      location: "প্যারিস ক্যাম্পাস",
      instructor: "অ্যান লরা",
      capacity: "৮/১০",
      rating: "৪.৭",
      description: "ব্যবসায়িক পরিবেশে ফরাসি ব্যবহার শিখুন। ব্যবসায়িক পরিভাষা, ইমেল লেখা, মিটিং পরিচালনা এবং উপস্থাপনা করার দক্ষতা অর্জন করুন।"
    },
    {
      id: 6,
      title: "কনভারসেশন ক্লাব",
      level: "A2-C2",
      days: "শুক্র",
      time: "সন্ধ্যা ৬টা - ৮টা",
      location: "উভয় ক্যাম্পাস",
      instructor: "বিভিন্ন প্রশিক্ষক",
      capacity: "১৫/২০",
      rating: "৪.৯",
      description: "আত্মবিশ্বাসের সাথে ফরাসি কথা বলতে শিখুন। সাপ্তাহিক গ্রুপ সেশনে বিভিন্ন বিষয়ে আলোচনা করুন এবং আপনার কথোপকথনের দক্ষতা উন্নত করুন।"
    }
  ]

  const getLevelColor = (level:any) => {
    if (level.includes("A1") || level.includes("A2")) return "bg-green-100 text-green-800"
    if (level.includes("B1") || level.includes("B2")) return "bg-blue-100 text-blue-800"
    if (level.includes("C1") || level.includes("C2")) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  const getCapacityColor = (capacity:any) => {
    const [current, max] = capacity.split('/').map(Number)
    const percentage = (current / max) * 100
    
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-green-600"
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
          
          {/* {schedules.map((schedule) => (
            <Card key={schedule.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {schedule.title}
                  </CardTitle>
                  <Badge className={getLevelColor(schedule.level)}>
                    {schedule.level}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {schedule.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{schedule.days}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{schedule.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{schedule.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    <span>প্রশিক্ষক: {schedule.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span className={getCapacityColor(schedule.capacity)}>
                        আসন: {schedule.capacity}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      <span>{schedule.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </Card>
          ))} */}
          

            <Card data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" key={1} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {"DELF A1"}
                    <div className='flex gap-1 items-center text-sm'>
                      <MapPin className="w-4 h-4 mr-0 text-primary" />Campus: Paris
                    </div>
                    
                  </CardTitle>
                  <Badge className={getLevelColor("A1")}>
                    {"Beginner"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {"DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grow">
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"শনিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সন্ধ্যা ৬:৩০ - রাত ০৯:৩০"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১৩ ডিসেম্বর"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"রবিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সন্ধ্যা ৬:৩০ - রাত ০৯:৩০"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ৭ ডিসেম্বর"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"মঙ্গল বার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"দুপুর ০৩:০০ -  ০৬:০০"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ২ ডিসেম্বর"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"বুধবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"দুপুর ০৩:০০ -  ০৬:০০"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ৩১ ডিসেম্বর"}</span>
                  </div>

                </div>



              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </Card>
            
            
            <Card data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100" key={2} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {"DELF A1"}
                    <div className='flex gap-1 items-center text-sm'>
                      <MapPin className="w-4 h-4 mr-0 text-primary" />Campus: Hoche
                    </div>
                    
                  </CardTitle>
                  <Badge className={getLevelColor("A1")}>
                    {"Beginner"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {"DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।"}
                </CardDescription>
              </CardHeader>
                            
              <CardContent className="grow">
                
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"রবিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ২৩ নভেম্বর"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সোমবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১৫ ডিসেম্বর"}</span>
                  </div>

                </div>
                



              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </Card>
            
            <Card data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="200" key={3} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {"DELF A2"}
                    <div className='flex gap-1 items-center text-sm'>
                      <MapPin className="w-4 h-4 mr-0 text-primary" />Campus: Paris
                    </div>
                    
                  </CardTitle>
                  <Badge className={getLevelColor("A1")}>
                    {"Beginner"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {"DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।"}
                </CardDescription>
              </CardHeader>
                            
              <CardContent className="grow">
                
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"শনিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ৩ জানুয়ারি ২০২৬"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সোমবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ৩ নভেম্বর"}</span>
                  </div>

                </div>

                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"মঙ্গলবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সন্ধ্যা ০৬:৩০ টা - ০৯:৩০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১১ নভেম্বর"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"বৃহস্পতিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সন্ধ্যা ০৬:৩০ টা - ০৯:৩০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১৩ নভেম্বর"}</span>
                  </div>

                </div>
                


              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </Card>


            <Card data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" key={4} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {"DELF A2"}
                    <div className='flex gap-1 items-center text-sm'>
                      <MapPin className="w-4 h-4 mr-0 text-primary" />Campus: Hoche
                    </div>
                    
                  </CardTitle>
                  <Badge className={getLevelColor("A1")}>
                    {"Beginner"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {"DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।"}
                </CardDescription>
              </CardHeader>
                            
              <CardContent className="grow">
                
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"রবিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"দুপুর ০৩:০০ টা - ০৬:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ৭ ডিসেম্বর"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সোমবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১২ জানুয়ারি ২০২৬"}</span>
                  </div>

                </div>

                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"মঙ্গলবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সন্ধ্যা ০৩:০০ টা - ০৬:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১১ নভেম্বর"}</span>
                  </div>

                </div>
                

              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </Card>


            <Card data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100" key={5} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {"DELF B1"}
                    <div className='flex gap-1 items-center text-sm'>
                      <MapPin className="w-4 h-4 mr-0 text-primary" />Campus: Paris
                    </div>
                    
                  </CardTitle>
                  <Badge className={getLevelColor("B1")}>
                    {"Intermediate"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700">
                  {"DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।"}
                </CardDescription>
              </CardHeader>
                            
              <CardContent className="grow">
                
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"রবিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"দুপুর ০৩:০০ টা - ০৬:০০ টা"}</span>
                    {/* <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span> */}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ৩০ নভেম্বর"}</span>
                    {/* <span>{"ক্লাস স্টার্ট: ৩ জানুয়ারি ২০২৬"}</span> */}
                  </div>

                </div>
                


                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"মঙ্গলবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ০৬ জানুয়ারি ২০২৬"}</span>
                  </div>

                </div>
                
                <div className="space-y-4 mb-6 border rounded p-4">
                  <div className="flex items-center text-sm text-gray-600 font-semibold">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{"বৃহস্পতিবার"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"সকাল ১১:০০ টা - ০২:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ২৩ অক্টোবর"}</span>
                  </div>
                  <hr />

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{"দুপুর ০৩:০০ টা - ০৬:০০ টা"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
                    <span>{"ক্লাস স্টার্ট: ১১ ডিসেম্বর"}</span>
                  </div>
                </div>
                


              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full">
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </Card>







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