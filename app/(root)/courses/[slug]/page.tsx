// app/courses/[slug]/page.tsx
import Link from "next/link";

type Course = {
  title: string;
  content: string;
  slug: string;

  acfCourses?: {
    duration?: string;
    level?: string;
    price?: string;
  };
};

/*
async function getCourse(slug: string): Promise<Course | null> {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query allCourses($slug: String!) {
          coursesBy(slug:$slug) {
            id
            title
          }
        }
      `,
      variables: { slug },
    }),
    next: { revalidate: 60 }, // ISR
  });

  const json = await res.json();

  console.log("Page data:", json)

  return json?.data?.course ?? null;
}
  */
async function getCourse(slug:string): Promise<Course | null> {
  
  
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query allCourses($slug: String!) {
          coursesBy(slug: $slug) {
            id
            title
            slug
          }
        }
      `,
      variables: {
        slug,
      },
    }),
    //next: { revalidate: 60 }, // ISR
  });

  const json = await res.json();
  // console.log("Page data:", JSON.stringify(json, null, 2));
  // console.log("getCourse data:", json);


  return json?.data?.coursesBy ?? null;
  

  // return null
}

async function getSchedules() {
  
  
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query allClassSchedules {
          allClassSchedule{
            edges {
              node {
                title
                classScheduleFields{
                  campus
                  days{
                    day
                    time
                    startingDate
                  }
                  course{
                    nodes{
                      id
                      slug
                    }
                  }
                }
              }
            }
          }
        }
      `,
    }),
    //next: { revalidate: 60 }, // ISR
  });

  const json = await res.json();
  // console.log("Schedule data:", JSON.stringify(json, null, 2));
  // console.log("Schedule data:", json);


  return json?.data?.allClassSchedule?.edges ?? null;
  

  // return null
}



export async function generateStaticParams() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query allCourses {
          allCourses(first: 100) {
            nodes {
              slug
            }
          }
        }
      `,
    }),
  });

  const json = await res.json();

  // console.log("Course Json", JSON.stringify(json, null,10)

  return json.data.allCourses.nodes.map((course: { slug: string }) => ({
    slug: course.slug,
  }));

}
  









export default async function CoursePage({params}: { params: { slug: string }}) {
  const paramList = await params
  // console.log("paramList", paramList)
  const course = await getCourse(paramList.slug);
  
  // console.log("Course Data:", course)

  const schedules = await getSchedules()
  // console.log("Schedules:", schedules)

  // schedules!.map((schedule:any) => console.log(schedule.node.classScheduleFields.course.nodes[0].slug))
  const thisCourseSchedules = schedules.filter((schedule:any) => schedule.node.classScheduleFields.course.nodes[0].slug === course!.slug )

  // console.log("thisCourseSchedules",JSON.stringify(thisCourseSchedules, null, 2))

  const sortedSchedules = [...thisCourseSchedules].sort((a, b) => {
    const campusA = a.node.classScheduleFields.campus;
    const campusB = b.node.classScheduleFields.campus;
  
    if (campusA === "Paris") return -1;
    if (campusB === "Paris") return 1;
  
    return 0;
  });






  if (!course) {
    return <h1>Course not found</h1>;
  }

  return (
    <>

      <section className="bg-green-gradient ">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  সর্বাধিক জনপ্রিয় কোর্স 
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-xl mb-6 ">
                শূন্য থেকে শুরু করে ফ্রেঞ্চ ভাষায় দক্ষ হন
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>৬ মাসের কোর্স {/* 6 Month Course */}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>সাপ্তাহিক ৩ দিন {/* 3 Days Weekly */}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>4.9 (২৩৪ রিভিউ)</span>
                </div>
              </div>

              <div className="">
                <Link href="/#contact_section" data-slot="button" className="ine-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-900 text-white px-8 py-3">পরামর্শের জন্য যোগাযোগ করুন</Link>
              </div>
              
              {/*
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                  <span className="ml-2">4.9 (২৩৪ রিভিউ) </span>
                </div>
              </div> 
              */}


              
            </div>
            
            <div className="md:col-span-2 bg-gray-100  rounded-lg shadow-xl p-6 text-gray-800 h-fit flex flex-col gap-2">

              {sortedSchedules.map((item:any, index:number) => {
                const { campus, days } = item.node.classScheduleFields;

                return (
                  <div
                    key={index}
                    className="rounded-lg border p-4 shadow-sm "
                  >
                    {/* Campus Name */}
                    <h2 className="text-xl font-semibold mb-1">
                      {campus}
                    </h2>

                    {/* Days */}
                    <div className="space-y-0">
                      {days.map((dayItem:any, dayIndex:number) => (
                        <div key={dayIndex} className="rounded-md " >
                          
                          {dayItem.day} | {dayItem.time} | ক্লাস স্টার্ট: {dayItem.startingDate}
                          
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}


              
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              কোর্স সম্পর্কে {/* About This Course */}
            </h2>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                আমাদের ফ্রেঞ্চ ভাষা কোর্সটি শুরু থেকে উন্নত পর্যায় পর্যন্ত ডিজাইন করা হয়েছে। এই কোর্সে আপনি A1 লেভেল থেকে B2 লেভেল পর্যন্ত ফ্রেঞ্চ ভাষা শিখতে পারবেন। DELF ও TEF পরীক্ষার জন্য প্রস্তুতি নিতে এই কোর্স আদর্শ।
                {/* Our French language course is designed from beginner to advanced level. In this course, you can learn French from A1 to B2 level. This course is ideal for preparing for DELF and TEF exams. */}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">কোর্সের বৈশিষ্ট্য {/* Course Features */}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                      </svg>
                      <span className="text-gray-700">১২০+ ঘন্টার লাইভ ক্লাস {/* 120+ Hours Live Classes */}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                      </svg>
                      <span className="text-gray-700">লাইফটাইম সাপোর্ট {/* Lifetime Support */}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                      </svg>
                      <span className="text-gray-700">রেকর্ডেড ভিডিও অ্যাক্সেস {/* Recorded Video Access */}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">কারা করতে পারবে {/* Who Can Join */}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                      </svg>
                      <span className="text-gray-700">যারা ফ্রান্সে উচ্চশিক্ষার পরিকল্পনা করছেন {/* Those planning higher education in France */}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                      </svg>
                      <span className="text-gray-700">যারা কানাডায় ইমিগ্রেট করতে চান {/* Those who want to immigrate to Canada */}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                      </svg>
                      <span className="text-gray-700">যারা নতুন ভাষা শিখতে আগ্রহী {/* Those interested in learning new languages */}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              আপনি কী শিখবেন {/* What You'll Learn */}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              কোর্স শেষে আপনি ফ্রেঞ্চ ভাষায় দক্ষ হয়ে উঠবেন {/* After completing the course, you will become proficient in French */}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-indigo-500">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">কথা বলার দক্ষতা {/* Speaking Skills */}</h3>
              <p className="text-gray-600 text-sm">নিজের মতামত প্রকাশ করতে পারবেন এবং দৈনন্দিন কথোপকথনে অংশগ্রহণ করতে পারবেন {/* You'll be able to express your opinion and participate in daily conversations */}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-purple-500">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">পড়ার দক্ষতা {/* Reading Skills */}</h3>
              <p className="text-gray-600 text-sm">ফ্রেঞ্চ বই, সংবাদপত্র এবং নিবন্ধ পড়তে পারবেন {/* You'll be able to read French books, newspapers and articles */}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-pink-500">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">লেখার দক্ষতা {/* Writing Skills */}</h3>
              <p className="text-gray-600 text-sm">চিঠি, ইমেল এবং প্রবন্ধ ফ্রেঞ্চে লিখতে পারবেন {/* You'll be able to write letters, emails and essays in French */}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">শোনার দক্ষতা {/* Listening Skills */}</h3>
              <p className="text-gray-600 text-sm">ফ্রেঞ্চ সিনেমা, গান এবং সংবাদ বুঝতে পারবেন {/* You'll understand French movies, songs and news */}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-yellow-500">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">সংস্কৃতি বোঝা {/* Cultural Understanding */}</h3>
              <p className="text-gray-600 text-sm">ফ্রান্সের সংস্কৃতি ও রীতিনীতি জানতে পারবেন {/* You'll know French culture and customs */}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-red-500">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">পরীক্ষার প্রস্তুতি {/* Exam Preparation */}</h3>
              <p className="text-gray-600 text-sm">DELF, TEF ও TCF পরীক্ষার জন্য পূর্ণ প্রস্তুতি {/* Full preparation for DELF, TEF and TCF exams */}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            কোর্স কারিকুলাম {/* Course Curriculum */}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            বিস্তারিত কোর্স সিলেবাস ও মডিউল {/* Detailed course syllabus and modules */}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-indigo-700 text-white p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">৬ মাসের কোর্স কাঠামো {/* 6 Month Course Structure */}</h3>
                <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ২৪ মডিউল {/* 24 Modules */}
                </span>
              </div>
            </div>
            
            <div className="divide-y">
              {/* Module 1 */}
              <div className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">মডিউল ১: ফ্রেঞ্চ পরিচয় {/* Module 1: Introduction to French */}</h4>
                    <p className="text-sm text-gray-500">সপ্তাহ ১-২ {/* Week 1-2 */}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>ফ্রেঞ্চ বর্ণমালা ও উচ্চারণ রীতি {/* French alphabet and pronunciation rules */}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>অভিবাদন ও পরিচিতি {/* Greetings and introductions */}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>সংখ্যা, দিন, মাস ও ঋতু {/* Numbers, days, months and seasons */}</span>
                  </li>
                </ul>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>১০ টি ভিডিও লেকচার, ৫ টি কুইজ {/* 10 Video Lectures, 5 Quizzes */}</span>
                </div>
              </div>
              
              {/* Module 2 */}
              <div className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">মডিউল ২: মৌলিক ব্যাকরণ {/* Module 2: Basic Grammar */}</h4>
                    <p className="text-sm text-gray-500">সপ্তাহ ৩-৪ {/* Week 3-4 */}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>বিশেষ্য ও লিঙ্গ {/* Nouns and genders */}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>নির্দিষ্ট ও অনির্দিষ্ট আর্টিকেল {/* Definite and indefinite articles */}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>সাধারণ ক্রিয়াপদ ও বর্তমান কাল {/* Common verbs and present tense */}</span>
                  </li>
                </ul>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>১২ টি ভিডিও লেকচার, ৬ টি কুইজ {/* 12 Video Lectures, 6 Quizzes */}</span>
                </div>
              </div>
              
              {/* Module 3 */}
              <div className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">মডিউল ৩: যোগাযোগ দক্ষতা {/* Module 3: Communication Skills */}</h4>
                    <p className="text-sm text-gray-500">সপ্তাহ ৫-৬ {/* Week 5-6 */}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>রেস্তোরাঁয় খাবার অর্ডার দেওয়া {/* Ordering food at restaurants */}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>দিকনির্দেশনা চাওয়া ও দেওয়া {/* Asking for and giving directions */}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>শপিং ও দামাদামি {/* Shopping and bargaining */}</span>
                  </li>
                </ul>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>৮ টি ভিডিও লেকচার, ৪ টি কুইজ, ২ টি অ্যাসাইনমেন্ট {/* 8 Video Lectures, 4 Quizzes, 2 Assignments */}</span>
                </div>
              </div>
              
              {/* More modules can be added similarly */}
              
              <div className="p-6 bg-indigo-50">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">আরও ২১ টি মডিউল রয়েছে {/* 21 more modules available */}</p>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                    সম্পূর্ণ কারিকুলাম দেখুন {/* View Full Curriculum */}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            আপনার প্রশিক্ষক {/* Your Instructor */}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            অভিজ্ঞ ও পেশাদার ফ্রেঞ্চ ভাষা শিক্ষক {/* Experienced and professional French language teacher */}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img src="/images/hero-img.webp" alt="French Instructor" className="w-full h-full object-cover" />
            </div>
            <div className="md:w-2/3 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">অনন্যা চৌধুরী {/* Ananya Chowdhury */}</h3>
              <p className="text-indigo-600 font-semibold mb-4">প্রধান ফ্রেঞ্চ প্রশিক্ষক {/* Lead French Instructor */}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">অভিজ্ঞতা {/* Experience */}</p>
                  <p className="font-semibold">১২+ বছর {/* 12+ Years */}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">শিক্ষার্থী {/* Students */}</p>
                  <p className="font-semibold">৫০০০+ {/* 5000+ */}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">রেটিং {/* Rating */}</p>
                  <p className="font-semibold">4.9/5.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">কোর্স {/* Courses */}</p>
                  <p className="font-semibold">৮ টি {/* 8 Courses */}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                অনন্যা চৌধুরী প্যারিস বিশ্ববিদ্যালয় থেকে ফ্রেঞ্চ ভাষায় মাস্টার্স ডিগ্রি অর্জন করেছেন। তিনি DELF B2 সার্টিফাইড এবং ১২ বছরেরও বেশি সময় ধরে ফ্রেঞ্চ ভাষা শিক্ষা দিচ্ছেন। তার ছাত্ররা সফলভাবে ফ্রান্স ও কানাডায় উচ্চশিক্ষা ও ইমিগ্রেশন সম্পন্ন করেছে।
                {/* Ananya Chowdhury obtained her Master's degree in French from the University of Paris. She is DELF B2 certified and has been teaching French for over 12 years. Her students have successfully completed higher education and immigration in France and Canada. */}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">DELF B2 Certified</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">TEF Expert</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Native Speaker</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">PhD in French Literature</span>
              </div>
              
              <div className="flex space-x-4">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                  প্রোফাইল দেখুন {/* View Profile */}
                </button>
                <button className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition">
                  যোগাযোগ করুন {/* Contact */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    {/* 

     <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            কোর্স ফি ও ভর্তি প্রক্রিয়া
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            সাশ্রয়ী মূল্যে মানসম্মত ফ্রেঞ্চ ভাষা শিক্ষা 
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">ফ্রেঞ্চ ভাষা কোর্স (A1-B2) </h3>
                <p className="text-indigo-100 mb-6">সীমিত সময়ের জন্য বিশেষ অফার </p>
                
                <div className="flex justify-center items-baseline mb-6">
                  <span className="text-5xl font-extrabold">৳১৫,০০০</span>
                  <span className="ml-3 text-xl line-through text-indigo-200">৳২০,০০০</span>
                  <span className="ml-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">২৫% ছাড়</span>
                </div>
                
                <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105">
                  এখনই ভর্তি হন 
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <h4 className="text-lg font-semibold mb-4">কোর্স ফিতে যা থাকছে </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-700">১২০+ ঘন্টার লাইভ ক্লাস </span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-700">সমস্ত স্টাডি মেটেরিয়াল </span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-700">লাইফটাইম ভিডিও অ্যাক্সেস </span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-700">সার্টিফিকেট </span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-700">মক টেস্ট </span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-700">লাইফটাইম সাপোর্ট</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-800">অফারটি শেষ হবে </p>
                    <p className="text-sm text-gray-600">৩ দিন ১২ ঘন্টা ৪৫ মিনিট </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
 */}
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            সচরাচর জিজ্ঞাসা 
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            আপনার প্রশ্নের উত্তর 
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition">
                <span className="font-semibold text-gray-800">কোর্সটি কত দিনের? </span>
                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="px-6 pb-4 text-gray-700">
                কোর্সটি মোট ৬ মাসের। সপ্তাহে ৩ দিন ক্লাস হয়, প্রতি ক্লাস ২ ঘন্টা করে। 
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition">
                <span className="font-semibold text-gray-800">অনলাইন ক্লাস কিভাবে হবে? </span>
                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="px-6 pb-4 text-gray-700">
                আমরা Zoom প্ল্যাটফর্মের মাধ্যমে লাইভ অনলাইন ক্লাস নিই। সব ক্লাস রেকর্ড করা হয় এবং আপনি যেকোনো সময় দেখতে পারবেন।
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition">
                <span className="font-semibold text-gray-800">কোর্স শেষে কি সার্টিফিকেট দেওয়া হয়? </span>
                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="px-6 pb-4 text-gray-700">
                হ্যাঁ, কোর্স সফলভাবে শেষ করলে আমরা একটি সার্টিফিকেট প্রদান করি যা আন্তর্জাতিকভাবে স্বীকৃত। 
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition">
                <span className="font-semibold text-gray-800">কিস্তিতে ফি দেওয়ার সুবিধা আছে? </span>
                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="px-6 pb-4 text-gray-700">
                হ্যাঁ, আপনি ২ কিস্তিতে ফি দিতে পারেন। প্রথম কিস্তি ভর্তির সময় এবং দ্বিতীয় কিস্তি ৩ মাস পর। 
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>







    </>
  );
}
