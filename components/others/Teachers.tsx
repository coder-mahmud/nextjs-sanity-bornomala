import React from 'react'
import Image from 'next/image'


const TEACHER_QUERY = `
  query allTeachers {
    teachers  (where: {
      orderby: { field: MENU_ORDER, order: ASC }}) {
      nodes {
        title
        tags{
          nodes{
            name
          }
        }
        teacherFields{
          teacherImage{
            node{
              sourceUrl
            }
          }
          teacherDesignation
          teacherDescription
          experience
          numberOfCourses
          totalStudents
          shortDescription
          
        
          
        }
      }
    }
  }
`

async function getTeachersData() {
  const res = await fetch(process.env.WP_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: TEACHER_QUERY }),
    // next: { revalidate: 60 }, // ISR
    // cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("GraphQL request for getHomeData failed")
  }

  const json = await res.json()
  // console.log("teachers data:", json)



  if (!json?.data?.teachers) {
    return null
  }
  return json.data.teachers
}

const Teachers = async () => {
  const teacherData = await getTeachersData();
  
  const teacherArr  = teacherData.nodes

  // console.log("Tch data arr:", JSON.stringify(teacherArr, null,5))
  
  return (

      <section data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">বর্ণমালার টিচার্স প্যানেল</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2  gap-8 justify-center">
            {teacherArr && teacherArr.map((teacher:any,idx:number) => (
              <div className='border rounded p-6' key={idx}>
                {teacher.teacherFields.teacherImage && <Image className='rounded' src={teacher.teacherFields.teacherImage.node.sourceUrl} alt={teacher.title} height={300} width={300} />}

                <div className="teacher_meta mt-2">
                  <p className='font-bold'>{teacher.title }</p>
                  <p className='text-sm'>{teacher.teacherFields.teacherDesignation }</p>
                  <p className='text-sm '>{teacher.teacherFields.shortDescription }</p>
                </div>
                  
              </div>
            ))}
            
          {/* {aboutData.teachers.map((teacher:any,idx:number) => (
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
          ))} */}
            
            


           
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
  )
}

export default Teachers