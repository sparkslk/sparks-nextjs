import React from "react";

// Mock Next.js components for demo
const Link: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export default function Footer() {
  const userLinks = [
    { href: "/signup", label: "Get Started" },
    { href: "/login", label: "Sign In" },
    { href: "/features", label: "Features" },
    { href: "/resources", label: "Resources" },
  ];

  const supportLinks = [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/community", label: "Community" },
    { href: "/feedback", label: "Feedback" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/accessibility", label: "Accessibility" },
    { href: "/security", label: "Security" },
  ];

  return (
    <footer
      className="relative mt-16 overflow-hidden border-t border-gray-200"
      style={{ backgroundColor: "#F5F3FB" }}
    >
      {/* Subtle background decoration matching other sections */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-16 w-24 h-24 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-2xl"></div>
        <div className="absolute bottom-16 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-6 md:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-2xl font-bold" style={{ color: "#8159A8" }}>
                SPARKS
              </h3>
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full mt-2"></div>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-sm font-light">
              Comprehensive ADHD support platform designed specifically for Sri
              Lankan communities, empowering individuals and families with
              culturally-aware tools and resources.
            </p>
          </div>

          {/* For Users */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-900">For Users</h3>
            <ul className="space-y-3 text-gray-600">
              {userLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-gray-900 transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-900">Support</h3>
            <ul className="space-y-3 text-gray-600">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-gray-900 transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-900">Legal</h3>
            <ul className="space-y-3 text-gray-600">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-gray-900 transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="py-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          <div className="text-gray-600 text-center lg:text-left font-light">
            © 2025{" "}
            <span className="font-semibold" style={{ color: "#8159A8" }}>
              SPARKS
            </span>
            . All rights reserved. Made with ❤️ for Sri Lanka.
          </div>
        </div>
      </div>
    </footer>
  );
}
