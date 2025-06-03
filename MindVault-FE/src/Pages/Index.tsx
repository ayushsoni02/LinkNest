// import { Link } from "react-router-dom";
// import { Button } from "../components/custom/Button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/custom/Card";
// import { Bookmark, Globe, Twitter, Youtube, FileText, Zap, Shield, Users } from "lucide-react";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Features from "../components/Features";
import PlatformShowcase from "../components/PlateformShowcase";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <Hero />
      <PlatformShowcase />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;