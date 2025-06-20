import { useEffect, useState } from 'react'
import { Button1 } from '../components/Button'
import Card from '../components/Card'
import CreateContentModel from '../components/CreateContentModel'
import { Plusicon } from '../icons/PlusIcon'
import ShareIcon from '../icons/ShareIcon'
import Sidebar from '../components/Sidebar'
import { useContent } from '../hooks/UseContent'
import axios from 'axios'
import { BACKEND_URL } from '../Config'
import Navigation from '../components/Navigation'
import { useNavigate } from 'react-router-dom'
import { FRONTEND_URL } from '../Config'

function Dashboard() {
  const [modelOpen, setModelOpen] = useState(false);
  type Content = { _id: string; title: string; type: string; link: string };
  const { contents, refresh } = useContent() as { contents: Content[]; refresh: () => void };
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/signin');
    return;
  }

  const loadContent = async () => {
    setLoading(true);
    try {
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  loadContent();
}, [modelOpen]);

  const handleDelete = async (_id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${_id}`, {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });
      refresh();
    } catch (err) {
      alert("Failed to delete content.");
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    refresh();
  }, [modelOpen]);

  // Filter logic
  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) && (!activeFilter || content.type === activeFilter)
  );

  return (
    <div>
      <Navigation />
      <div className='p-4 min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white'>
        <Sidebar className="hidden md:block fixed" onFilterChange={setActiveFilter} />
        <div className='md:pl-72 p-2' >
          <CreateContentModel open={modelOpen} onClose={() => setModelOpen(false)} />
          <div className='flex justify-between items-center gap-4 '>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="p-2 rounded border w-full max-w-md bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <div className='flex gap-2 justify-end'>
              <Button1
                onClick={() => setModelOpen(true)}
                variant="primary"
                text="Add content"
                startIcon={<Plusicon />}
              />
              <Button1
                onClick={async () => {
                  try {
                    const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`, {
                      share: true
                    }, {
                      headers: {
                        'Authorization': localStorage.getItem("token") || ''
                      }
                    });
                    const shareUrl = `${FRONTEND_URL}/share/${response.data.hash}`;
                    alert(shareUrl);
                  } catch (error) {
                    alert("Unable to share brain. Are you logged in?");
                    console.error(error);
                  }
                }}
                variant="secondary"
                text="Share Nest"
                startIcon={<ShareIcon />}
              />
            </div>
          </div>

          {loading ? (
            // Skeleton loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center pt-10 justify-center h-96 text-center gap-4 text-gray-500 dark:text-gray-300">
              <img
                src="/undraw_no-data_ig65.svg"
                alt="Empty"
                className="w-30 h-40 object-contain"
              />
              <h2 className="text-xl font-semibold">Looks like it’s empty in here!</h2>
              <p className="max-w-md">
                You haven’t added any content yet — or your current filter is too specific. Let’s get started!
              </p>
              <button
                onClick={() => setModelOpen(true)}
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                + Add your first link
              </button>
            </div>
          ) : (
            // Actual content
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-8">
              {filteredContents.map(({ _id, type, link, title }) => {
                const allowedTypes = ["youtube", "twitter", "linkedin", "medium", "Dev.to", "other"] as const;
                if (allowedTypes.includes(type as typeof allowedTypes[number])) {
                  return (
                    <Card
                      key={_id}
                      id={_id}
                      type={type as typeof allowedTypes[number]}
                      link={link}
                      title={title}
                      onDelete={handleDelete}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;