import React, { useState, useEffect } from "react";

// Mock Card components for demo
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  isVisible: boolean;
}

const FeatureCard = ({
  title,
  description,
  icon,
  index,
  isVisible,
}: FeatureCardProps) => (
  <div
    className={`
            group transition-all duration-600 transform
            ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }
        `}
    style={{
      transitionDelay: `${index * 150}ms`,
      transitionDuration: "600ms",
    }}
  >
    <Card className="text-center hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-gray-200 h-full">
      <CardHeader className="p-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-lg transition-all duration-300"
          style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}
        >
          <div style={{ color: "#8159A8" }}>{icon}</div>
        </div>
        <CardTitle className="text-xl mb-4 text-gray-900">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>

      {/* Subtle hover accent */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-3 transition-opacity duration-300"
        style={{ backgroundColor: "#8159A8" }}
      ></div>
    </Card>
  </div>
);

export default function FeaturesSection() {
  const [visibleItems, setVisibleItems] = useState(false);

  const features = [
    {
      title: "ADHD Assessment",
      description:
        "Comprehensive screening tools aligned with Sri Lankan healthcare standards",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: "Daily Management",
      description:
        "Track symptoms, mood, and progress with personalized insights and recommendations",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: "Education & Resources",
      description:
        "Localized content about ADHD, coping strategies, and family support guides",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      title: "Community Support",
      description:
        "Connect with families, professionals, and support groups in Sri Lanka",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleItems(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ backgroundColor: "#F5F3FB" }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-2">
        <div className="absolute top-20 right-16 w-40 h-40 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 blur-3xl"></div>
        <div className="absolute bottom-16 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SPARKS
            </span>{" "}
            is a system of tools
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Unlike single-function apps, we provide comprehensive support
            covering all aspects of ADHD management.
          </p>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              index={index}
              isVisible={visibleItems}
              {...feature}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .opacity-2 {
          opacity: 0.02;
        }
      `}</style>
    </section>
  );
}
