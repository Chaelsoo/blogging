import { withBase } from "./utils/helpers";

export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Project = {
    name: string;
    description?: string;
    date: string; // YYYY-MM
    href: string;
    tags?: string[];
};

export type Hero = {
    eyebrowText?: string;
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type About = {
    title?: string;
    text?: string;
};

export type Blog = {
    description?: string;
};

export type ContactInfo = {
    title?: string;
    text?: string;
    email?: {
        text?: string;
        href?: string;
        email?: string;
    };
    socialProfiles?: {
        text?: string;
        href?: string;
    }[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    website: string;
    logo?: Image;
    title: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    about?: About;
    contactInfo?: ContactInfo;
    subscribe?: Subscribe;
    blog?: Blog;
    projects?: Project[];
    postsPerPage?: number;
    recentPostLimit: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    website: 'https://chaelsoo.me',
    title: 'kanyo',
    description: 'I write about things so they stick around, maybe they will for you too.',
    image: {
        src: '/space-ahead-preview.jpeg',
        alt: 'kanyo — cybersec, cloud, and automation writeups by Abderrahmen.'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: withBase('/')
        },
        {
            text: 'Blogs',
            href: withBase('/blog')
        },
        {
            text: 'Tags',
            href: withBase('/tags')
        },
        {
            text: 'Projects',
            href: withBase('/projects')
        },
        {
            text: 'About',
            href: withBase('/about')
        },
        {
            text: 'Contact',
            href: withBase('/contact')
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: withBase('/about')
        },
        {
            text: 'Contact',
            href: withBase('/contact')
        },
        {
            text: 'RSS Feed',
            href: withBase('/rss.xml')
        },
        {
            text: 'Sitemap',
            href: withBase('/sitemap-index.xml')
        }
    ],
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/Chaelsoo'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/abderrahmen-dellaa-a78517249/'
        },
        {
            text: 'X/Twitter',
            href: 'https://twitter.com/'
        }
    ],
    hero: {
        eyebrowText: 'cybersec · cloud · automation',
        title: 'a work in progress',
        text: "I write about things so they stick around, maybe they will for you too.",
        image: {
            src: '/assets/images/pixeltrue-space-discovery.svg',
            alt: 'A person sitting at a desk in front of a computer'
        },
        actions: [
            {
                text: 'Read Now',
                href: withBase('/blog')
            },
            {
                text: 'View on Github',
                href: 'https://github.com/Chaelsoo'
            }
        ]
    },
    about: {
        title: 'About',
        text: 'this is a collection of things I worked through. figured if it was hard enough to figure out, it was worth writing down. hope you find it useful.',
    },
    contactInfo: {
        title: 'Contact',
        text: "Hi! Whether you have a question, a suggestion, or just want to share your thoughts, I'm all ears. Feel free to get in touch through any of the methods below:",
        email: {
            text: "Drop me an email and I’ll do my best to respond as soon as possible.",
            href: "mailto:abderrahmendel@gmail.com",
            email: "abderrahmendel@gmail.com"
        },
        socialProfiles: [
        {
            text: 'GitHub',
            href: 'https://github.com/Chaelsoo'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/abderrahmen-dellaa-a78517249/'
        },
        {
            text: 'X/Twitter',
            href: 'https://twitter.com/'
        }
        ]
    },
    subscribe: {
        title: 'Subscribe to Space Ahead',
        text: 'One update per week. All the latest stories in your inbox.',
        formUrl: '#'
    },
    blog: {
        description: ""
    },
    projects: [
        {
            name: 'rshade',
            description: 'Passive recon for initial sweeps using Shodan, so you learn a lot without sending a single packet to the target.',
            date: '2026-03',
            href: 'https://github.com/Chaelsoo/rshade',
            tags: ['recon', 'shodan']
        },
        {
            name: 'BugScope',
            description: 'A GitHub commit monitor that flags security-relevant changes and pings you on Telegram with a short triage summary.',
            date: '2026-03',
            href: 'https://github.com/Chaelsoo/bugscope',
            tags: ['monitoring', 'supply-chain']
        },
        {
            name: 'eBPF-Toolkit',
            description: 'Kernel level network visibility with eBPF, TCP lifecycle tracing plus optional TLS plaintext capture via OpenSSL uprobes.',
            date: '2026-02',
            href: 'https://github.com/Chaelsoo/eBPF-Toolkit',
            tags: ['ebpf', 'network']
        },
        {
            name: 'Kfuzz',
            description: 'A coverage guided fuzzer for black box binaries, built around AFL++ QEMU mode with crash triage helpers.',
            date: '2025-12',
            href: 'https://github.com/Chaelsoo/Kfuzz',
            tags: ['fuzzing', 'ctf', 'binary']
        },
        {
            name: 'SSH Key Doctor',
            description: 'A tiny bash utility to validate SSH keys and fix the usual footguns like CRLF, bad perms, and malformed headers.',
            date: '2026-03',
            href: 'https://github.com/Chaelsoo/SSH-Key-Doctor',
            tags: ['ssh', 'tooling']
        }
    ],
    postsPerPage: 3,
    recentPostLimit: 3,
    projectsPerPage: 3
};

export default siteConfig;
