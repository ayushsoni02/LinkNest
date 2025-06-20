import { useRef, useState } from "react";
import CrossIcon from "../icons/CrossIcon";
import { Button1 } from "./Button";
import { Input } from "./Input";
import axios from "axios";
import { BACKEND_URL } from "../Config";

const CONTENT_TYPES = ["youtube", "twitter", "linkedin", "medium", "Dev.to", "other"];

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateContentModel({ open, onClose }: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("youtube");

  async function addContent() {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;

    await axios.post(
      `${BACKEND_URL}/api/v1/content`,
      {
        link,
        title,
        type
      },
      {
        headers: {
          Authorization: localStorage.getItem("token") || ""
        }
      }
    );
    onClose();
  }

  if (!open) return null;

  return (
    <div className=" fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className=" z-10 bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <CrossIcon />
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Add content here!
        </h2>

        {/* Form Content */}
        <div className="space-y-5 dark:text-blue-950">
          <Input reference={titleRef} placeholder="Title" />
          <Input reference={linkRef} placeholder="Link" />

          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Type:</h3>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((ct) => (
                <Button1
                  key={ct}
                  text={ct.charAt(0).toUpperCase() + ct.slice(1)}
                  variant={type === ct ? "primary" : "secondary"}
                  onClick={() => setType(ct)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button1 onClick={addContent} variant="primary" text="Submit" />
          </div>
        </div>
      </div>
    </div>
  );
}
