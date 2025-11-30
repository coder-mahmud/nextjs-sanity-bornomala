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

export default function Home() {
  return (
    <>
      <HomeHero />
      <FeaturesSection />
      <TestimonialsSection />
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
