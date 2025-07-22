import { useState, useEffect } from "react";

export default function UniquenessSection() {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);

  const existingProjects = [
    "Focused on single-function apps (mood trackers, appointment schedulers)",
    "Designed with generic, global audiences in mind",
    "No specialized ADHD focus or local context",
  ];

  const sparksApproach = [
    "Comprehensive platform covering assessment, management, education, and community",
    "Features and content aligned with Sri Lankan education and healthcare systems",
    "Specialized ADHD management tools designed for local needs",
  ];

  useEffect(() => {
    // Animate header first
    const headerTimer = setTimeout(() => {
      setHeaderVisible(true);
    }, 200);

    // Then animate cards
    const cardsTimer = setTimeout(() => {
      setVisibleCards(new Set([0]));
      setTimeout(() => {
        setVisibleCards(new Set([0, 1]));
      }, 300);
    }, 600);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(cardsTimer);
    };
  }, []);

  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ backgroundColor: "#F5F3FB" }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-purple-200 blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-gradient-to-r from-purple-200 to-gray-200 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-gray-200 to-purple-200 blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Uniqueness
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-8">
            What makes SPARKS different from existing solutions
          </p>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Existing Projects Card */}
          <div
            className={`
              relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100
              transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1
              ${
                visibleCards.has(0)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }
            `}
          >
            {/* Subtle red accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500 rounded-t-3xl"></div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Existing Projects
              </h3>
            </div>

            <div className="space-y-4">
              {existingProjects.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 group">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SPARKS Approach Card */}
          <div
            className={`
              relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100
              transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1
              ${
                visibleCards.has(1)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }
            `}
            style={{ transitionDelay: "300ms" }}
          >
            {/* SPARKS gradient accent */}
            <div
              className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
              }}
            ></div>

            <div className="flex items-center space-x-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: "#8159A8" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
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
                Approach
              </h3>
            </div>

            <div className="space-y-4">
              {sparksApproach.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 group">
                  <div
                    className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"
                    style={{ backgroundColor: "#8159A8" }}
                  ></div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
            visibleCards.has(1)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block relative group cursor-pointer">
            {/* Glow effect */}
            <div
              className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
              style={{ backgroundColor: "#8159A8" }}
            ></div>

            {/* Content */}
            <div
              className="relative px-12 py-4 rounded-2xl font-bold text-xl text-white shadow-lg transform group-hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "#8159A8" }}
            >
              ✨ Experience the SPARKS Difference
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            Built specifically for Sri Lankan ADHD communities
          </p>
        </div>
      </div>

      <style jsx>{`
        .opacity-5 {
          opacity: 0.05;
        }
      `}</style>
    </section>
  );
}
