import React from 'react';
import { Helmet } from 'react-helmet';

const AboutByte = () => {
  return (
    <>
      <Helmet>
        <title>About Byte – Built for Campus Life</title>
        <meta
          name="description"
          content="Byte is Nigeria’s first student-focused food delivery platform. Learn how we're redefining campus hunger, one bite at a time."
        />
        <meta property="og:title" content="About Byte – Food for Campus Life" />
        <meta property="og:description" content="Built by students, for students. This is Byte." />
        <meta property="og:url" content="https://yumbyte.ng/about-byte" />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="min-h-screen bg-olive-dark text-accentwhite px-6 py-20 font-sans">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-cheese">
            About <span className="text-primary-600">Byte</span>
          </h1>
          <p className="text-lg sm:text-xl text-secondary-100 leading-relaxed mb-8">
            Byte is more than a food delivery platform — it's a tech-powered hunger solution built for Nigerian university students. 
            Whether you’re stuck in class, studying late at the hostel, or just avoiding long queues, Byte brings hot meals right to your hands.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-olive-light rounded-2xl p-6 shadow-card transition hover:shadow-lg">
              <h2 className="text-2xl font-bold text-cheese mb-2">🔥 Why Byte?</h2>
              <p className="text-secondary-100 leading-relaxed">
                Unlike traditional delivery apps, Byte is made *for campus*, not the city. We're focused on verified vendors, fast delivery, and affordable prices tailored to student pockets.
              </p>
            </div>

            <div className="bg-olive-light rounded-2xl p-6 shadow-card transition hover:shadow-lg">
              <h2 className="text-2xl font-bold text-cheese mb-2">🎯 Our Mission</h2>
              <p className="text-secondary-100 leading-relaxed">
                To revolutionize food access across Nigerian campuses, Byte is building a reliable, scalable ecosystem where students eat well, vendors thrive, and no one misses lunch again.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-secondary-200 mb-4">
              Byte is proudly launching first at <strong>FUOYE</strong> — and we’re coming to your campus soon.
            </p>
            <a
              href="/"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl shadow-soft transition"
            >
              🍔 Back to Home
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutByte;
