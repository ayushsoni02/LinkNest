import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
    LayoutGrid, 
    MessageSquare, 
    Share2, 
    Send, 
    Bot, 
    User, 
    Search
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import SmartLinkCard from "../components/SmartLinkCard";
import { useNests } from "../hooks/useNests";
import { useContent } from "../hooks/UseContent";

export default function NestWorkspace() {
    const { id } = useParams();
    const [viewMode, setViewMode] = useState<'gallery' | 'chat'>('gallery');
    const [input, setInput] = useState("");
    
    // Get nest and content data from API
    const { nests } = useNests();
    const { contents } = useContent();
    
    const nest = nests.find(n => n._id === id);
    const nestLinks = contents.filter(c => c.nestId?._id === id);
    
    // Initialize with AI greeting
    const [messages, setMessages] = useState([
        { 
            role: 'ai', 
            content: nest 
                ? `Hello! I've analyzed the ${nestLinks.length} link${nestLinks.length !== 1 ? 's' : ''} in your "${nest.name}" nest. Ask me anything about the content here.` 
                : 'Hello! How can I help you today?'
        }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', content: input }]);
        setInput("");
        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', content: "That's an interesting question regarding the content in this Nest. Based on the React article, Server Components run exclusively on the server to reduce bundle size." }]);
        }, 1000);
    };

    return (
        <div className="flex h-screen bg-white dark:bg-black">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-20 lg:ml-64 transition-all duration-300">
                {/* Top Bar */}
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white capitalize">
                        {nest?.name}
                        </h1>
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs rounded-full border border-zinc-200 dark:border-zinc-700">
                            {nestLinks.length} items
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                         {/* View Toggle */}
                         <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                             <button 
                                onClick={() => setViewMode('gallery')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'gallery' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                                title="Gallery View"
                             >
                                 <LayoutGrid size={18} />
                             </button>
                             <button 
                                onClick={() => setViewMode('chat')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'chat' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                                title="Chat with Nest"
                             >
                                 <MessageSquare size={18} />
                             </button>
                         </div>

                         <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
                             <Share2 size={16} />
                             Share Nest
                         </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden relative">
                    
                    {viewMode === 'gallery' ? (
                        /* Gallery View */
                        <div className="h-full overflow-y-auto p-6 lg:p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                                {nestLinks.map((link) => (
                                    <SmartLinkCard 
                                        key={link._id} 
                                        id={link._id}
                                        title={link.title}
                                        url={link.link}
                                        type={link.type}
                                        tags={link.tags}
                                        date={new Date(link.createdAt).toLocaleDateString()}
                                        summary={link.nestId?.name || 'No summary'}
                                        currentNestId={link.nestId?._id || null}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Chat Mode (Split Screen) */
                        <div className="flex h-full">
                            {/* Minimized Link List (Left) */}
                            <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-y-auto hidden md:block">
                                <div className="p-4 sticky top-0 bg-inherit z-10 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-3 text-zinc-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search context..." 
                                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    {nestLinks.map((link) => (
                                        <div key={link._id} className="flex items-start gap-3 p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 group">
                                            <div className="mt-0.5 text-lg opacity-70 group-hover:opacity-100">📁</div>
                                            <div className="overflow-hidden">
                                                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{link.title}</h4>
                                                <p className="text-xs text-zinc-500 truncate">{link.link}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Interface (Right) */}
                            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 relative">
                                {/* Message History */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'ai' && (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                                    <Bot size={18} className="text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            )}
                                            
                                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                                msg.role === 'user' 
                                                ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-500/20' 
                                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200 dark:border-zinc-800'
                                            }`}>
                                                {msg.content}
                                            </div>

                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                                    <User size={18} className="text-zinc-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 backdrop-blur">
                                    <div className="max-w-3xl mx-auto relative group">
                                        <input 
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Ask anything about the links in this Nest..."
                                            className="w-full pl-4 pr-12 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-zinc-800 dark:text-white placeholder-zinc-400"
                                        />
                                        <button 
                                            onClick={handleSend}
                                            className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/30 opacity-90 hover:scale-105 active:scale-95"
                                        >
                                            <Send size={18} />
                                        </button>
                                        
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 -z-10 bg-indigo-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <p className="text-center text-[10px] text-zinc-400 mt-2">AI Analyst can make mistakes. Check key takeaways.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
