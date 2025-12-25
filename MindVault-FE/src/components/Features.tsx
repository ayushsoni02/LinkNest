import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/custom/Card";
import { Zap, Shield, Users, Search, Tag, BarChart3 } from "lucide-react";
import SmartLinkCard from "./SmartLinkCard";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Save links instantly with our browser extension or mobile app. One click and it's organized.",
      color: "text-yellow-500"
    },
    {
      icon: Tag,
      title: "Smart Categories",
      description: "Automatically categorize links by platform and topic. Find exactly what you're looking for.",
      color: "text-blue-500"
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Search through your entire collection with advanced filters and keyword matching.",
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your links are encrypted and stored securely. Only you have access to your collection.",
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Share Collections",
      description: "Create public collections and share your curated links with friends and colleagues.",
      color: "text-purple-500"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your reading habits and discover patterns in your saved content.",
      color: "text-indigo-500"
    }
  ];

  return (
    <section className=" dark:bg-gray-900 text-black dark:text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className=" dark:bg-gray-900 text-black dark:text-white max-w-7xl mx-auto">
        <div className=" dark:bg-gray-900 text-black dark:text-white text-center mb-16">
          <h2 className=" dark:bg-gray-900 dark:text-white text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Organize Your Digital Life</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you save, organize, and rediscover the content that matters most to you.
          </p>
        </div>

        <div className=" dark:bg-gray-900 text-black dark:text-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className=" dark:bg-gray-900 text-black dark:text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className={` dark:bg-gray-900 text-black dark:text-white w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4`}>
                  <feature.icon className={` dark:bg-gray-900  dark:text-white h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className=" dark:bg-gray-900  dark:text-white text-xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className=" dark:bg-gray-900  dark:text-white text-gray-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Smart Link Cards Showcase */}
        <div className="mt-20 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Experience Intelligent Organization
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our Smart Link Cards automatically adapt to your content, providing AI-generated summaries and beautiful previews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <SmartLinkCard 
              title="Understanding React Server Components"
              url="https://react.dev"
              type="article"
              date="Oct 24, 2024"
              tags={["React", "WebDev", "Frontend"]}
              summary="A deep dive into how Server Components allow you to write UI that can be rendered and cached on the server, ensuring faster initial page loads and better performance."
              fullSummary="React Server Components (RSC) represent a paradigm shift in how we build React applications. By allowing components to run exclusively on the server, RSCs reduce the amount of JavaScript sent to the client, improving startup time. This article explores the architecture, data fetching patterns, and how RSCs integrate with Client Components for interactivity."
            />
             <SmartLinkCard 
              title="Building a SaaS with Next.js 14"
              url="https://youtube.com/watch?v=example"
              type="youtube"
              date="Nov 12, 2024"
              thumbnailUrl="https://i.ytimg.com/vi/W5teEht1bV8/hqdefault.jpg"
              tags={["SaaS", "NextJS", "Tutorial"]}
              summary="Complete walkthrough of building a modern SaaS application using Next.js 14, including authentication, database integration, and Stripe payments."
              fullSummary="This comprehensive tutorial covers the entire lifecycle of building a production-ready SaaS application. It starts with project setup using Next.js 14 App Router, moves on to integrating Clerk for authentication, setting up a Prisma database, and finally configuring Stripe for recurring subscription payments. Perfect for indie hackers and startups."
            />
            <SmartLinkCard 
              title="The Future of AI Agents"
              url="https://twitter.com/example"
              type="twitter"
              date="Dec 15, 2024"
              thumbnailUrl="https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg"
              tags={["AI", "Tech", "Future"]}
              summary="Autonomous agents will revolutionize how we interact with software. Instead of clicking buttons, we will declare goals and agents will execute them."
              fullSummary="The thread discusses the shift from specific software tools to goal-oriented AI agents. It argues that the next big platform shift isn't AR/VR or Crypto, but Agentic workflows where software acts on your behalf. Includes examples of agent frameworks like AutoGPT and BabyAGI."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Organizing?</h3>
            <p className="text-xl mb-8 opacity-90">Join thousands of users who never lose important content again.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Get Started Free
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;