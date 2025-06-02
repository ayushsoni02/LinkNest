import { Twitter, Youtube, FileText, Globe, Linkedin, Instagram } from "lucide-react";

const PlatformShowcase = () => {
  const platforms = [
    { name: "Twitter", icon: Twitter, color: "text-blue-400", count: "1.2K+" },
    { name: "YouTube", icon: Youtube, color: "text-red-500", count: "800+" },
    { name: "Medium", icon: FileText, color: "text-green-600", count: "600+" },
    { name: "LinkedIn", icon: Linkedin, color: "text-blue-600", count: "400+" },
    { name: "Instagram", icon: Instagram, color: "text-pink-500", count: "300+" },
    { name: "Other", icon: Globe, color: "text-gray-600", count: "500+" },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Save Links From All Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Favorite Platforms</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our users have already saved thousands of links across major platforms. Join them in building your personal knowledge library.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {platforms.map((platform) => (
            <div key={platform.name} className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <platform.icon className={`h-12 w-12 ${platform.color} mx-auto mb-4`} />
                <h3 className="font-semibold text-gray-900 mb-2">{platform.name}</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {platform.count}
                </p>
                <p className="text-xs text-gray-500">saved links</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformShowcase;