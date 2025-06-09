import { useEffect, useRef } from "react";
import DeleteIcon from "../icons/DeleteIcon";
import ShareIcon from "../icons/ShareIcon";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement | null) => void;
      };
    };
  }
}

interface CardProps {
  title: string;
  link: string;
  type: "youtube" | "twitter";
}

export default function Card({ title, link, type }: CardProps) {
  const tweetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === "twitter" && window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(tweetRef.current);
    }
  }, [type, link]);

  const embedLink =
    type === "youtube"
      ? link.replace("watch", "embed").replace("?v=", "/")
      : link.replace("x.com", "twitter.com");

  return (
    <div className="group relative p-4 bg-white rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 transition-all duration-300 ease-in-out max-w-sm w-full cursor-pointer">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col space-y-1">
          <h2 className="text-md font-medium text-gray-800 truncate">{title}</h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full w-fit capitalize">
            {type}
          </span>
        </div>
        <div className="flex space-x-3 text-gray-500">
          <a href={link} target="_blank" rel="noopener noreferrer" title="Open">
            <ShareIcon />
          </a>
          <a href={link} target="_blank" rel="noopener noreferrer" title="Delete">
            <DeleteIcon />
          </a>
        </div>
      </div>

      {/* Embed Content */}
      <div ref={tweetRef} className="rounded overflow-hidden aspect-video bg-gray-100">
        {type === "youtube" && (
          <iframe
            className="w-full h-full"
            src={embedLink}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        )}
        {type === "twitter" && (
          <blockquote className="twitter-tweet">
            <a href={embedLink}></a>
          </blockquote>
        )}
      </div>
    </div>
  );
}
