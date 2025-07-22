import React, { useState, useEffect } from "react";

interface ADHDChallengeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  isVisible: boolean;
}

const ADHDChallenge = ({
  icon,
  title,
  description,
  index,
  isVisible,
}: ADHDChallengeProps) => (
  <div
    className={`
            group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm
            hover:shadow-lg hover:border-gray-200 transition-all duration-500
            transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }
        `}
    style={{
      transitionDelay: `${index * 200}ms`,
      transitionDuration: "600ms",
    }}
  >
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300"
        style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}
      >
        <div style={{ color: "#8159A8" }}>{icon}</div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="font-bold text-xl text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-base">{description}</p>
      </div>
    </div>

    {/* Subtle hover accent */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
      style={{ backgroundColor: "#8159A8" }}
    ></div>
  </div>
);

export default function ADHDChallengesSection() {
  const [visibleItems, setVisibleItems] = useState(false);

  const challenges = [
    {
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      title: "Attention",
      description:
        "Difficulty focusing or sustaining attention on tasks, leading to incomplete work and missed details.",
    },
    {
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Impulsivity",
      description:
        "Acting without thinking, interrupting others, and making hasty decisions without considering consequences.",
    },
    {
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: "Hyperactivity",
      description:
        "Excessive movement, restlessness, and difficulty staying still in situations that require calm behavior.",
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
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-16 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Understanding{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ADHD
            </span>{" "}
            Challenges
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            ADHD affects individuals in multiple ways. Our platform addresses
            these core challenges comprehensively.
          </p>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
        </div>

        {/* Challenges Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge, index) => (
            <ADHDChallenge
              key={index}
              index={index}
              isVisible={visibleItems}
              {...challenge}
            />
          ))}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-base">
            <span className="font-semibold" style={{ color: "#8159A8" }}>
              SPARKS
            </span>{" "}
            provides targeted support for each of these challenges
          </p>
        </div>
      </div>

      <style jsx>{`
        .opacity-3 {
          opacity: 0.03;
        }
      `}</style>
    </section>
  );
}
