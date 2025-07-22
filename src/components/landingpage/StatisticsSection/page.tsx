import React, { useState, useEffect } from "react";

interface StatisticProps {
  value: string;
  label: string;
  description: string;
  index: number;
  isVisible: boolean;
}

const Statistic = ({
  value,
  label,
  description,
  index,
  isVisible,
}: StatisticProps) => (
  <div
    className={`
      group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm
      hover:shadow-lg hover:border-gray-200 transition-all duration-500
      transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }
    `}
    style={{
      transitionDelay: `${index * 200}ms`,
      transitionDuration: "600ms",
    }}
  >
    <div className="text-center space-y-4">
      {/* Value */}
      <div
        className="text-3xl md:text-4xl font-bold mb-2"
        style={{
          background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>

      {/* Label */}
      <div className="font-bold text-xl text-gray-900 mb-1">{label}</div>

      {/* Description */}
      <div className="text-gray-600 leading-relaxed text-base">
        {description}
      </div>
    </div>

    {/* Subtle hover accent */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
      style={{ backgroundColor: "#8159A8" }}
    ></div>
  </div>
);

export default function StatisticsSection() {
  const [visibleItems, setVisibleItems] = useState(false);

  const statistics = [
    {
      value: "5-6%",
      label: "Population Affected",
      description:
        "Of Sri Lanka's population is estimated to have ADHD, yet many remain undiagnosed.",
    },
    {
      value: "Limited",
      label: "Access to Diagnosis",
      description:
        "Many people, especially outside cities, lack access to proper ADHD support and resources.",
    },
    {
      value: "0",
      label: "Specialized Apps",
      description:
        "No existing digital platform designed specifically for ADHD support in Sri Lanka.",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleItems(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-16 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Real Support for{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Real
            </span>{" "}
            Challenges
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Understanding the scope of ADHD in Sri Lanka and why specialized
            support is crucial for our community.
          </p>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {statistics.map((stat, index) => (
            <Statistic
              key={index}
              index={index}
              isVisible={visibleItems}
              {...stat}
            />
          ))}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-base">
            <span className="font-semibold" style={{ color: "#8159A8" }}>
              SPARKS
            </span>{" "}
            bridges this gap with culturally-aware, evidence-based support
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
