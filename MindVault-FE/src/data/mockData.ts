// Mock Data for LinkNest Prototype
// This file contains hardcoded data for demonstrating the UI/UX flow

export interface Nest {
    id: string;
    name: string;
    icon: string; // emoji
    color: string; // hex color
    description?: string;
    createdAt: string;
}

export interface Link {
    id: string;
    title: string;
    url: string;
    type: 'article' | 'youtube' | 'twitter' | 'dev' | 'other';
    tags: string[]; // e.g., ['AI', 'Solana', 'React']
    nestId: string | null; // null = uncategorized
    summary: string;
    fullSummary?: string;
    thumbnailUrl?: string;
    createdAt: string;
}

// Sample Nests
export const mockNests: Nest[] = [
    {
        id: '1',
        name: 'Read Later',
        icon: '📚',
        color: '#6366f1',
        description: 'Articles and content to read when you have time',
        createdAt: '2024-12-01',
    },
    {
        id: '2',
        name: 'Solana',
        icon: '⚡',
        color: '#14F195',
        description: 'Everything about Solana blockchain',
        createdAt: '2024-12-15',
    },
    {
        id: '3',
        name: 'AI Research',
        icon: '🤖',
        color: '#8B5CF6',
        description: 'Latest AI and machine learning research',
        createdAt: '2024-12-18',
    },
    {
        id: '4',
        name: 'Web3 Dev',
        icon: '🌐',
        color: '#10B981',
        description: 'Web3 development resources',
        createdAt: '2024-12-20',
    },
];

// Sample Links
export const mockLinks: Link[] = [
    {
        id: '1',
        title: 'Understanding Solana\'s Proof of History',
        url: 'https://solana.com/news/proof-of-history',
        type: 'article',
        tags: ['Solana', 'Blockchain', 'PoH'],
        nestId: '2', // Solana nest
        summary: 'Comprehensive guide to understanding Proof of History and how it makes Solana the fastest blockchain.',
        fullSummary: 'Proof of History (PoH) is a cryptographic clock that enables nodes to agree on time without communicating. This innovation allows Solana to process 65,000+ transactions per second.',
        createdAt: '2024-12-20',
    },
    {
        id: '2',
        title: 'Building AI Agents with LangChain',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        tags: ['AI', 'LangChain', 'Tutorial'],
        nestId: '3', // AI Research nest
        summary: 'Complete tutorial on building autonomous AI agents using LangChain framework.',
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        createdAt: '2024-12-22',
    },
    {
        id: '3',
        title: 'AI Agents Will Replace Software Engineers',
        url: 'https://twitter.com/sama/status/123456789',
        type: 'twitter',
        tags: ['AI', 'Future'],
        nestId: null, // Uncategorized
        summary: 'Sam Altman\'s perspective on how AI agents will transform software development.',
        thumbnailUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        createdAt: '2024-12-23',
    },
    {
        id: '4',
        title: 'React Server Components Deep Dive',
        url: 'https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components',
        type: 'article',
        tags: ['React', 'WebDev', 'RSC'],
        nestId: '1', // Read Later
        summary: 'Understanding the architecture and benefits of React Server Components.',
        fullSummary: 'React Server Components let you write components that render on the server, reducing bundle size and improving performance. They can directly access backend resources.',
        createdAt: '2024-12-18',
    },
    {
        id: '5',
        title: 'Solana DApp Development Tutorial',
        url: 'https://youtube.com/watch?v=abc123',
        type: 'youtube',
        tags: ['Solana', 'Web3', 'Tutorial'],
        nestId: '2', // Solana nest
        summary: 'Build your first decentralized application on Solana blockchain.',
        thumbnailUrl: 'https://i.ytimg.com/vi/abc123/mqdefault.jpg',
        createdAt: '2024-12-21',
    },
    {
        id: '6',
        title: 'The Future of Crypto is AI',
        url: 'https://twitter.com/vitalikbuterin/status/987654321',
        type: 'twitter',
        tags: ['Crypto', 'AI', 'Web3'],
        nestId: null, // Uncategorized
        summary: 'Vitalik Buterin discusses the intersection of AI and cryptocurrency.',
        thumbnailUrl: 'https://pbs.twimg.com/profile_images/977496875887558661/L86xyLF4_400x400.jpg',
        createdAt: '2024-12-24',
    },
    {
        id: '7',
        title: 'Building a SaaS with Next.js 14',
        url: 'https://youtube.com/watch?v=W5teEht1bV8',
        type: 'youtube',
        tags: ['NextJS', 'SaaS', 'Tutorial'],
        nestId: '1', // Read Later
        summary: 'Complete walkthrough of building a modern SaaS application with Next.js.',
        thumbnailUrl: 'https://i.ytimg.com/vi/W5teEht1bV8/mqdefault.jpg',
        createdAt: '2024-12-19',
    },
    {
        id: '8',
        title: 'Advanced TypeScript Patterns',
        url: 'https://dev.to/advanced-typescript-patterns',
        type: 'article',
        tags: ['TypeScript', 'WebDev'],
        nestId: null, // Uncategorized
        summary: 'Learn advanced TypeScript patterns for building robust applications.',
        createdAt: '2024-12-17',
    },
    {
        id: '9',
        title: 'GPT-4 Vision API Tutorial',
        url: 'https://youtube.com/watch?v=vision123',
        type: 'youtube',
        tags: ['AI', 'GPT', 'Tutorial'],
        nestId: '3', // AI Research
        summary: 'How to use GPT-4\'s vision capabilities in your applications.',
        thumbnailUrl: 'https://i.ytimg.com/vi/vision123/mqdefault.jpg',
        createdAt: '2024-12-25',
    },
    {
        id: '10',
        title: 'Solana vs Ethereum Gas Fees',
        url: 'https://twitter.com/solanafdn/status/111222333',
        type: 'twitter',
        tags: ['Solana', 'Ethereum', 'Blockchain'],
        nestId: '2', // Solana nest
        summary: 'Comparison of transaction costs between Solana and Ethereum networks.',
        createdAt: '2024-12-23',
    },
    {
        id: '11',
        title: 'Web3 Security Best Practices',
        url: 'https://blog.openzeppelin.com/web3-security',
        type: 'article',
        tags: ['Web3', 'Security', 'Blockchain'],
        nestId: '4', // Web3 Dev
        summary: 'Essential security practices for Web3 developers to protect smart contracts.',
        fullSummary: 'Learn about common vulnerabilities like reentrancy attacks, integer overflows, and access control issues. Implement best practices using OpenZeppelin libraries.',
        createdAt: '2024-12-16',
    },
    {
        id: '12',
        title: 'React 19 New Features',
        url: 'https://youtube.com/watch?v=react19',
        type: 'youtube',
        tags: ['React', 'WebDev'],
        nestId: null, // Uncategorized
        summary: 'Overview of all the new features coming in React 19.',
        thumbnailUrl: 'https://i.ytimg.com/vi/react19/mqdefault.jpg',
        createdAt: '2024-12-24',
    },
    {
        id: '13',
        title: 'AI-Powered Code Generation',
        url: 'https://dev.to/ai-code-generation',
        type: 'article',
        tags: ['AI', 'Coding', 'DevTools'],
        nestId: '3', // AI Research
        summary: 'How AI-powered tools are transforming the way developers write code.',
        createdAt: '2024-12-22',
    },
    {
        id: '14',
        title: 'Deploying Solana Programs',
        url: 'https://solana.com/docs/programs/deploying',
        type: 'article',
        tags: ['Solana', 'DevOps', 'Blockchain'],
        nestId: '4', // Web3 Dev
        summary: 'Step-by-step guide to deploying and upgrading Solana programs.',
        createdAt: '2024-12-21',
    },
    {
        id: '15',
        title: 'The AI Alignment Problem',
        url: 'https://twitter.com/ylecun/status/444555666',
        type: 'twitter',
        tags: ['AI', 'Ethics', 'Research'],
        nestId: null, // Uncategorized
        summary: 'Yann LeCun discusses challenges in aligning AI systems with human values.',
        createdAt: '2024-12-25',
    },
];

// Helper Functions
export const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    mockLinks.forEach(link => {
        link.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
};

export const getLinksByNest = (nestId: string | null): Link[] => {
    return mockLinks.filter(link => link.nestId === nestId);
};

export const getLinksByTag = (tag: string): Link[] => {
    return mockLinks.filter(link => link.tags.includes(tag));
};

export const getLinksByType = (type: Link['type']): Link[] => {
    return mockLinks.filter(link => link.type === type);
};

export const getUncategorizedLinks = (): Link[] => {
    return mockLinks.filter(link => link.nestId === null);
};

export const getNestById = (nestId: string): Nest | undefined => {
    return mockNests.find(nest => nest.id === nestId);
};
