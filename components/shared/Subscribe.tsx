'use client'
import React from 'react'
import { subsCribeAction } from '@/actions/form'

const submitForm = async (e:any) => {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(e.currentTarget);
  // console.log("email:", formData.get("email"))
   
  const res = await subsCribeAction(formData.get("email"))
  console.log("ApiRes:", res)
  form.reset();
}

const Subscribe = () => {
  return (
      <section className="">
        <div className="container">
          
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-primary/80 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 md:mr-6">
                <h3 className="text-lg text-white font-bold mb-2">নিউজলেটার সাবস্ক্রাইব করুন</h3>
                <p className="text-white text-sm">
                  আমাদের কোর্স, ইভেন্ট এবং অফার সম্পর্কে আপডেট পেতে সাইন আপ করুন
                </p>
              </div>
              <form onSubmit={submitForm} className="flex flex-col sm:flex-row w-full md:w-auto">
                <input 
                  type="email" 
                  placeholder="আপনার ইমেল ঠিকানা" 
                  className="bg-white px-4 py-2 rounded-l-lg focus:outline-none text-gray-900 w-full sm:w-auto"
                  name="email"
                />
                <button className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-r-lg font-medium transition-colors duration-300 mt-2 sm:mt-0">
                  সাবস্ক্রাইব
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Subscribe