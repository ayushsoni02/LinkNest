// import { Button } from "../components/custom/Button";
// import { Bookmark } from "lucide-react";
// import { Link } from "react-router-dom";

// const Navigation = () => {
//   return (
//     <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-2">
//             <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
//               <Bookmark className="h-6 w-6 text-white" />
//             </div>
//             <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               LinkKeepers
//             </Link>
//           </div>

//           {/* Navigation Links */}
//           <div className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
//               Home
//             </Link>
//             <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
//               Dashboard
//             </Link>
//             <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
//               About
//             </Link>
//           </div>

//           {/* Auth Buttons */}
//           <div className="flex items-center space-x-4">
//             <Button variant="ghost" asChild>
//               <Link to="/signin">Sign In</Link>
//             </Button>
//             <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
//               <Link to="/signup">Sign Up</Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navigation;


import { useEffect, useState } from "react";
import { Button } from "../components/custom/Button";
import { Bookmark, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";

const Navigation = () => {
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUsername(user);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsername(null);
    navigate("/signin");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 dark:bg-gray-800 text-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Bookmark className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LinkNest
            </Link>
          </div>

          {/* Navigation Links */}
          <div className=" hidden md:flex items-center space-x-8">
            <Link to="/" className=" dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className=" dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/about" className=" dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              About
            </Link>
          </div>

          {/* Right-side section */}
          <div className="flex items-center space-x-4">
            {/* Toggle Dark Mode */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {username ? (
              <ProfileDropdown username={username} onLogout={handleLogout} />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
