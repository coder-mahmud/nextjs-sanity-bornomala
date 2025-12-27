import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="">


      {/* Hero Section */}
      <section className="text-center py-20 px-4 sm:px-6 lg:px-8  mx-auto bg-primary-gradient">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
          বাংলার হৃদয় থেকে <br className="hidden sm:block" /> ফ্রান্সের দ্বারপ্রান্তে
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          ফ্রান্সের সৌন্দর্য, সংস্কৃতি আর সম্ভাবনার দুয়ার খুলতে ভাষা হলো চাবিকাঠি। আমরা বুঝি যে, এই যাত্রা কখনও সহজ হয় না। তাই আমাদের প্রতিটি ক্লাস, প্রতিটি পদ্ধতি তৈরি করা হয়েছে আপনার সুবিধার কথা মাথায় রেখে।
          </p>
          <button className="mt-10 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <a href="/#contact_section">বিনামূল্যে পরামর্শ বুক করুন</a>
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold  mb-4">আমাদের লক্ষ্য</h2>
          <p className="text-2xl text-gray-800 font-light italic leading-relaxed">
          আমাদের উদ্দেশ্য হলো ফরাসি ভাষা শেখাকে সহজ, কার্যকর ও বাস্তবমুখী করা। আমরা শিক্ষার্থীদের এমনভাবে প্রশিক্ষণ দিই যেন তারা আত্মবিশ্বাসের সাথে ফরাসি ভাষায় কথা বলতে, বুঝতে, পড়তে ও লিখতে পারে—চাকরি, পড়াশোনা, ভ্রমণ কিংবা আন্তর্জাতিক যোগাযোগের জন্য। অভিজ্ঞ কোচ, গাইডেড লার্নিং ও প্র্যাকটিক্যাল অনুশীলনের মাধ্যমে আমরা প্রতিটি শিক্ষার্থীর ভাষাগত দক্ষতা গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>
      </section>

      <section className="bg-primary-gradient py-20">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-6">
    কেন École Bornomala ?
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          title: "ব্যক্তিগত গাইডলাইন",
          desc: "প্রতিটি শিক্ষার্থীর লক্ষ্য অনুযায়ী আলাদা শেখার পরিকল্পনা।",
        },
        {
          title: "প্র্যাকটিক্যাল ফোকাস",
          desc: "বাস্তব জীবনের কথোপকথন ও পরীক্ষাভিত্তিক অনুশীলন।",
        },
        {
          title: "অভিজ্ঞ মেন্টর",
          desc: "ফরাসি ভাষায় দক্ষ ও আন্তর্জাতিক অভিজ্ঞতাসম্পন্ন কোচ।",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border p-6 text-center hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
          <p className="text-gray-600">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>


<section className=" py-20">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-12">
      আমরা যেভাবে শেখাই
    </h2>

    <div className="grid md:grid-cols-4 gap-6">
      {[
        "শুনে শেখা (Listening)",
        "কথোপকথন অনুশীলন (Speaking)",
        "পড়া ও বোঝা (Reading)",
        "লেখার দক্ষতা (Writing)",
      ].map((step, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 text-center shadow-sm"
        >
          <div className="text-2xl font-bold text-blue-600 mb-3">
            0{i + 1}
          </div>
          <p className="font-medium">{step}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="bg-primary-gradient py-20">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-12">
      এই কোর্সটি কাদের জন্য?
    </h2>

    <div className="grid md:grid-cols-2 gap-10">
      <ul className="space-y-4 text-gray-700">
        <li>✔️ ফ্রান্স বা ইউরোপে পড়াশোনা করতে আগ্রহী শিক্ষার্থী</li>
        <li>✔️ ফরাসি ভাষাভাষী দেশে চাকরি বা বসবাসের পরিকল্পনা</li>
        <li>✔️ DELF / DALF পরীক্ষার প্রস্তুতি</li>
        <li>✔️ একদম নতুন বা বেসিক জানা শিক্ষার্থী</li>
      </ul>

      <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-8">
        <p className="text-lg font-medium">
          আপনি যদি ফরাসি ভাষায় আত্মবিশ্বাসের সাথে কথা বলতে চান —
          তাহলে এই কোচিং আপনার জন্যই।
        </p>
      </div>
    </div>
  </div>
</section>


<section className="bg-gray-50 py-20">
  <div className="max-w-5xl mx-auto px-6 text-center">
    <h2 className="text-3xl font-bold mb-6">
      আমাদের কোচিং দর্শন
    </h2>

    <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
      আমরা বিশ্বাস করি ভাষা শেখা মানে শুধু শব্দ মুখস্থ করা নয়,
      বরং আত্মবিশ্বাস তৈরি করা। প্রতিটি শিক্ষার্থী যেন বাস্তব জীবনে
      ফরাসি ভাষা ব্যবহার করতে পারে — সেটাই আমাদের মূল লক্ষ্য।
    </p>
  </div>
</section>



<section className="bg-primary-gradient py-20 text-center">
  <div className="max-w-4xl mx-auto px-6">
    <h2 className="text-3xl font-bold mb-6">
      আজই আপনার French Learning Journey শুরু করুন
    </h2>
    <p className="mb-8 ">
      একটি ফ্রি কাউন্সেলিং সেশন বুক করে জানুন আপনার জন্য
      কোন কোর্সটি সবচেয়ে উপযুক্ত।
    </p>

    <button className="mt-10 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
      <a href="/#contact_section">বিনামূল্যে পরামর্শ বুক করুন</a>
    </button>
  </div>
</section>





      {/* Team Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">বর্ণমালার টিচার্স প্যানেল</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Team Member 1 */}
            <div className="text-center">
              <img
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                src="https://i.pravatar.cc/150?img=26" // Placeholder image
                alt="অনন্যার ছবি"
              />
              <h3 className="text-xl font-semibold text-gray-900">তাওহিদ</h3>
              <p className=" font-medium">CEO & Main instructor</p>
              <p className="mt-3 text-gray-600 text-sm">
                বাংলা সাহিত্যে স্নাতকোত্তর এবং মনের গহীনে একজন গল্পকার, অনন্যা নিশ্চিত করেন যে বর্ণমালার প্রতিটি পাঠ সাংস্কৃতিক প্রামাণিকতা এবং ভাষার প্রতি ভালোবাসায় পূর্ণ।
              </p>
            </div>
            {/* Team Member 2 */}
            <div className="text-center">
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Community Section */}
      <section className="bg-primary-gradient py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold  mb-4">
            আমাদের কমিউনিটিতে যোগ দিন
          </h2>
          <p className="text-xl mb-8">
            শেখা একটি ভাগ করে নেওয়ার অভিযান। বর্ণমালা পরিবারের অংশ হোন এবং বাংলা ভাষার সাথে আপনার নিজের গল্প লেখা শুরু করুন।
          </p>
            <button className="mt-10 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <a href="https://www.facebook.com/dailyfrenchbybornomala/"> আমাদের ফেসবুকে যোগ দিন</a>
            </button>          
        </div>
      </section>
    </main>
  );
}