// Card.tsx
import { useEffect, useRef, useState } from "react";
import DeleteIcon from "../icons/DeleteIcon";
import OpenIcon from "../icons/ShareIcon";
import WhatsAppIcon from "../icons/Whatsapp";
import ConfirmModal from "./ConfirmModel";

// Note: twttr type is now provided by react-social-media-embed

interface CardProps {
  id: string; // MongoDB _id
  title: string;
  link: string;
  type: "youtube" | "twitter" | "linkedin" | "medium" | "Dev.to" | "other";
  onDelete: (id: string) => void | Promise<void>; // 🛠 receives id now
}

export default function Card({ id, title, link, type, onDelete }: CardProps) {
  const tweetRef = useRef<HTMLDivElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    onDelete(id);
    setConfirmOpen(false);
  };

  useEffect(() => {
    // Use any cast to avoid conflict with react-social-media-embed types
    const twttr = (window as any).twttr;
    if (type === "twitter" && twttr?.widgets) {
      twttr.widgets.load(tweetRef.current);
    }
  }, [type, link]);

  const getEmbed = () => {
    if (type === "youtube") {
      const embed = link.replace("watch", "embed").replace("?v=", "/");
      return (
        <iframe
          className="w-full h-full"
          src={embed}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      );
    }

    if (type === "twitter") {
      const tweetLink = link.replace("x.com", "twitter.com");
      return (
        <blockquote className="twitter-tweet">
          <a href={tweetLink}></a>
        </blockquote>
      );
    }

    // Enhanced preview for other platforms
    const getPlatformInfo = () => {
      switch (type.toLowerCase()) {
        case "dev.to":
          return { name: "Dev.to", icon: "📝", color: "bg-black text-white" };
        case "linkedin":
          return { name: "LinkedIn", icon: "💼", color: "bg-blue-600 text-white" };
        case "medium":
          return { name: "Medium", icon: "📖", color: "bg-green-600 text-white" };
        case "github":
          return { name: "GitHub", icon: "🐙", color: "bg-gray-800 text-white" };
        default:
          return { name: type, icon: "🔗", color: "bg-gray-600 text-white" };
      }
    };

    const platformInfo = getPlatformInfo();

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border rounded-md hover:shadow-lg transition-all duration-300">
        <div className={`text-4xl mb-4 p-4 rounded-full ${platformInfo.color} shadow-lg`}>
          {platformInfo.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
          Content from {platformInfo.name}
        </p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span className="mr-2">View on {platformInfo.name}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    );
  };

  return (
    <div className="group relative p-4 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out max-w-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col space-y-1 max-w-[70%]">
          <h2 className="text-md font-semibold text-gray-800 dark:text-white truncate">
            {title}
          </h2>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full capitalize w-fit">
            {type}
          </span>
        </div>
        <div className="flex space-x-3 text-gray-500 dark:text-gray-300 mt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on WhatsApp"
          >
            <WhatsAppIcon />
          </a>


          <a href={link} target="_blank" rel="noopener noreferrer" title="Open">
            <OpenIcon />
          </a>
          <button onClick={() => setConfirmOpen(true)} title="Delete">
            <DeleteIcon />
          </button>
        </div>
      </div>

      {/* Embed Section */}
      <div
        ref={tweetRef}
        className="rounded-lg overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 border dark:border-gray-700"
      >
        {getEmbed()}
      </div>

      {/* Fixed ConfirmModal - removed the button children */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title={`Delete "${title}"?`}
        description="Are you sure you want to delete this content? This cannot be undone."
      />
    </div>
  );
}