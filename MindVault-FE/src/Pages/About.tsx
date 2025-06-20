import Navigation from "../components/Navigation";
import { useState } from "react";
import Footer from "../components/Footer";

const About = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="dark:bg-gray-900 text-black dark:text-white min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-6">
          About LinkNest
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 text-lg">
          LinkNest helps you capture, organize, and revisit the content that matters most — all in one place. Think of it as your digital second brain for useful links.
        </p>

        {/* Mission Block */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600"> Why it Exists</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            The internet is full of incredible content — from deep Twitter threads to thought-provoking YouTube videos. But we often forget to bookmark or return to them.
            <br />
            LinkNest helps you keep these gems organized, searchable, and always accessible.
          </p>
        </section>

        {/* Screenshot */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-purple-600">📸 Dashboard Preview</h2>
          <div className="rounded-xl overflow-hidden shadow-lg border dark:border-gray-700 mb-4">
            <img
              src="/pic-2.png"
              alt="LinkNest Dashboard"
              className="w-full object-cover"
            />
            
          </div>
           {/* <div className="rounded-xl overflow-hidden shadow-lg border dark:border-gray-700 mt-5">
            <img
              src="/pic-1.png"
              alt="LinkNest Dashboard"
              className="w-full object-cover"
            />
            
          </div> */}
        </section>

        {/* Feedback Form */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">📬 Share Feedback</h2>
          {submitted ? (
            <p className="text-green-500 font-medium">Thanks for your feedback! 💌</p>
          ) : (
            <form
              action="https://formsubmit.co/el/kikino"
              method="POST"
              onSubmit={() => setSubmitted(true)}
              className="space-y-4"
            >
              {/* Replace your@email.com with your actual address */}
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value={window.location.href} />

              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
              />
              <textarea
                name="message"
                placeholder="Your feedback..."
                required
                rows={4}
                className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition"
              >
                Send Feedback
              </button>
            </form>
          )}
        </section>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-block bg-blue-800 text-white px-6 py-3 rounded-xl shadow-md hover:bg-purple-700 transition"
          >
            🔗 Explore My LinkNest
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
