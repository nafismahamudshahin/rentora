export const navLinks = [
    { label: "Home", href: "/" },
    { label: "All Equipment", href: "/equipment" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Contact", href: "/contact" },
];

export const footerColumns = [
    {
        title: "Explore",
        links: [
            { label: "Home", href: "/" },
            { label: "All Equipment", href: "/equipment" },
            { label: "How it works", href: "/#how-it-works" },
            { label: "About us", href: "/about" },
        ],
    },
    {
        title: "Categories",
        links: [
            "Construction",
            "Photography",
            "Vehicles",
            "Agriculture",
            "Electronics",
            "Events",
        ].map((c) => ({ label: c, href: `/equipment?category=${c.toLowerCase()}` })),
    },
    {
        title: "Support",
        links: [
            { label: "Contact us", href: "/contact" },
            { label: "Help center", href: "/help" },
            { label: "Terms of service", href: "/terms" },
            { label: "Privacy policy", href: "/privacy" },
        ],
    },
];