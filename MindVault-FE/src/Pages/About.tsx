import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className=" dark:bg-gray-900 text-black dark:text-white min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About LinkNest</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            LinkNest was born from a simple yet powerful observation: people discover amazing content every day across various platforms, but they often forget to revisit these valuable resources.
          </p>
          <p className="text-gray-600 mb-6">
            Our mission is to help you build a personal knowledge library that grows with you, making it easy to save, organize, and rediscover the content that matters most to your personal and professional growth.
          </p>
          <p className="text-gray-600">
            Whether it's an insightful Twitter thread, an educational YouTube video, or a thought-provoking Medium article, LinkKeepers ensures you never lose track of valuable content again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;