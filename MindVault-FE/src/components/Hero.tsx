import { Button } from "../components/custom/Button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className=" dark:bg-gray-900 text-black dark:text-white pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className=" dark:bg-gray-900 text-black dark:text-white max-w-7xl mx-auto text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
          <Star className="h-4 w-4 mr-2" />
          Never lose an important link again
        </div>

        {/* Hero Title */}
        <h1 className=" dark:bg-gray-900  dark:text-white text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
          Your Digital
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
            Link Vault
          </span>
        </h1>

        {/* Hero Description */}
        <p className=" dark:bg-gray-900 text-black dark:text-white text-xl  mb-12 max-w-3xl mx-auto leading-relaxed">
          Save, organize, and rediscover meaningful content from Twitter, YouTube, Medium, and more. 
          Never forget that inspiring article or video you wanted to revisit.
        </p>

        {/* CTA Buttons */}
        <div className=" dark:bg-gray-900 text-black dark:text-white flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 rounded-full" asChild>
            <Link to="/signup">
              Start Organizing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-full border-2" asChild>
            <Link to="/about">Learn More</Link>
          </Button>
        </div>

        {/* Hero Visual */}
        <div className=" dark:bg-gray-900 text-black dark:text-white relative max-w-4xl mx-auto">
          <div className=" dark:bg-gray-900 text-black dark:text-white bg-white rounded-2xl shadow-2xl p-8 border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sample Link Cards */}
              <div className=" dark:bg-gray-900 text-black dark:text-white bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Twitter</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">AI Revolution Thread</h4>
                <p className="text-xs text-gray-600">Insightful thread about AI...</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Y</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">YouTube</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Coding Tutorial</h4>
                <p className="text-xs text-gray-600">React best practices...</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-l-4 border-green-500">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Medium</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Design Principles</h4>
                <p className="text-xs text-gray-600">Modern UI/UX trends...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;