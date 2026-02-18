// app/courses/[slug]/page.tsx
import Link from "next/link";
// export const dynamic = "force-dynamic";
import Image from "next/image";
import FaqBlock from "@/components/shared/FaqBlock";


type Course = {
  title: string;
  content: string;
  slug: string;
  coursesFields:{
    courseTagLine?: string;
    courseSubtitle?: string;
    duration?: string;
    numberOfStudents?: string;
    rating?: string;
    characteristics?: string;
    courseTargetPeople?: string;
    courseDetailedDescription?: string;
    coursePurposeTitle?: string;
    coursePurposeSubtitle?: string;
    coursePurposes?: [{icon:{node:{sourceUrl:string}}, title:string, description:string}];
    teacher?: {nodes:{title:string,
      tags?: {
        nodes: {
          id: string;
          name: string;
          slug: string;
        }[];
      };
      teacherFields:{
      teacherImage:{
        node:{
          sourceUrl:string
        }
      },
      teacherDescription:string,
      experience:string,
      rating:string,
      numberOfCourses:string,
      totalStudents:string,
      teacherDesignation:string,
      
      
      
      
    }}[]};
    faqs:{question:string, answer:string}[];
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
            title
            slug
            coursesFields {
              courseTagLine
              courseSubtitle
              duration
              numberOfStudents
              rating
              characteristics
              courseTargetPeople
              courseDetailedDescription
              coursePurposeTitle
              coursePurposeSubtitle
              coursePurposes {
                icon {
                  node {
                    sourceUrl
                  }
                }
                title
                description
              }

              teacher {
                nodes {
                  ... on Teacher {
                    id
                    title
                    slug
                    tags{
                      nodes{
                        name
                      }
                    }
                    teacherFields {
                    teacherImage{
                      node{
                        sourceUrl
                      }
                    }
                      teacherDescription
                      teacherDesignation
                      experience
                      rating
                      numberOfCourses
                      totalStudents
                    }
                  }
                }
              }
              faqs{
                question
                answer
              }
                
              
              
              
              
              
            }
          }
        }
      `,
      variables: {
        slug,
      },
    }),
    next: {
      tags: ["courses"],
    },
    //next: { revalidate: 60 }, // ISR
  });
  if (!res.ok) {
    throw new Error("GraphQL request for single course failed")
  }
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
  if(!course){
    return "Course not found!"
  }
  const courseFields = course.coursesFields;

  const teacher = courseFields?.teacher?.nodes[0]
  // console.log("teacher:", JSON.stringify( courseFields.teacher, null, 10))
  // console.log("teacher:", JSON.stringify( courseFields.teacher, null, 10))
  
  // console.log("Course faqs:", courseFields.faqs)

  const schedules = await getSchedules()
  // console.log("Schedules:", schedules)

  const validSchedules = schedules.filter((schedule:any) => !!schedule?.node?.classScheduleFields?.course?.nodes)

  // schedules!.map((schedule:any) => console.log(schedule.node.classScheduleFields.course.nodes[0].slug))
  const thisCourseSchedules = validSchedules.filter((schedule:any) => schedule.node.classScheduleFields.course.nodes[0].slug === course!.slug )

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

      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="bg-green-gradient ">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                {courseFields.courseTagLine && <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {courseFields.courseTagLine}
                </span> }
                
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              {courseFields?.courseSubtitle &&  <p className="text-xl mb-6 ">
                 {courseFields?.courseSubtitle}
              </p>}
              
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>{courseFields.duration}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>{courseFields.numberOfStudents}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span>{courseFields.rating}</span>
                </div>
              </div>

              <div className="">
                <Link href="/contact" data-slot="button" className="ine-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-900 text-white px-8 py-3">পরামর্শের জন্য যোগাযোগ করুন</Link>
              </div>
              


              
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
                      {days && days.map((dayItem:any, dayIndex:number) => (
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

      <section data-aos="fade-up" data-aos-offset="100" data-aos-duration="1000" data-aos-delay={0} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              কোর্স সম্পর্কে
            </h2>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div
                className="text-gray-700 leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: courseFields.courseDetailedDescription ?? "" }}
              />
              
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">কোর্সের বৈশিষ্ট্য</h3>
                    <div className="content_list" dangerouslySetInnerHTML={{__html:courseFields.characteristics ?? '' }} />
                 
                </div>
                

                {courseFields.courseTargetPeople && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">কোর্সটি  কাদের জন্যে?</h3>
                    <div className="content_list" dangerouslySetInnerHTML={{__html:courseFields.courseTargetPeople ?? '' }} />
                  </div>
                )}
                


              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {courseFields.coursePurposeTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {courseFields.coursePurposeSubtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {courseFields.coursePurposes && courseFields.coursePurposes.map((purpose,index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-indigo-500">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Image src={purpose.icon.node.sourceUrl} alt={course.title} width={32} height={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{purpose.title}</h3>
              <div dangerouslySetInnerHTML={{__html: purpose.description ?? ''}} />
            </div>
            ))}




          </div>
        </div>
      </section>

      {teacher && (
        <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={0} className="py-16">
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
                <Image alt={teacher.title} src={teacher.teacherFields.teacherImage.node.sourceUrl} width={200} height={300} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-2/3 p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{teacher?.title}</h3>
                <p className="text-indigo-600 font-semibold mb-4"> {teacher?.teacherFields.teacherDesignation} </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">অভিজ্ঞতা</p>
                    <p className="font-semibold">{teacher?.teacherFields.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">শিক্ষার্থী </p>
                    <p className="font-semibold">{teacher?.teacherFields.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">রেটিং </p>
                    <p className="font-semibold">{teacher?.teacherFields.rating}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">কোর্স </p>
                    <p className="font-semibold">{teacher?.teacherFields.numberOfCourses}</p>
                  </div>
                </div>
                
                <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{__html:teacher?.teacherFields.teacherDescription ?? ''}}  />
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {teacher?.tags && teacher.tags.nodes.map((tag:any,idx:number) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{tag.name}</span>
                  ))}
                </div>
                



              </div>
            </div>
          </div>
        </div>
      </section>


      )}
      
    
      <FaqBlock faqs={courseFields.faqs} title="সচরাচর জিজ্ঞাসা "  />


    </>
  );
}
