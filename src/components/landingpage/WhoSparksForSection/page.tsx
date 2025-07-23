import { useState, useEffect, useMemo } from "react";

export default function WhoSparksForSection() {
  const [visibleItems, setVisibleItems] = useState(new Set());

  const targetAudience = useMemo(
    () => [
      {
        text: "Individuals with ADHD seeking comprehensive support",
      },
      {
        text: "Families looking for guidance and management tools",
      },
      {
        text: "Healthcare professionals treating ADHD patients",
      },
      {
        text: "Educators working with ADHD students",
      },
      {
        text: "Support groups and community organizations",
      },
      {
        text: "Anyone interested in understanding ADHD better",
      },
    ],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      targetAudience.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => new Set([...prev, index]));
        }, index * 200);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [targetAudience]);

  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ backgroundColor: "#F5F3FB" }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 blur-3xl"></div>
        <div className="absolute bottom-20 left-16 w-32 h-32 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Who&apos;s{" "}
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
            For?
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Audience Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-4 md:gap-5">
            {targetAudience.map((item, index) => (
              <div
                key={index}
                className={`
                  flex items-center space-x-4 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm
                  hover:shadow-md hover:border-gray-200 transition-all duration-300
                  transform ${
                    visibleItems.has(index)
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  transitionDuration: "500ms",
                  width: "max-content",
                  minWidth: "100%",
                }}
              >
                {/* Check mark */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8159A8" }}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Text */}
                <span className="text-lg text-gray-700 font-medium leading-relaxed whitespace-nowrap flex-1">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-block relative group">
            {/* Glow effect */}
            <div
              className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
              style={{ backgroundColor: "#8159A8" }}
            ></div>

            {/* Button */}
            <div
              className="relative px-12 py-4 rounded-2xl font-bold text-xl text-white shadow-lg transform group-hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "#8159A8" }}
            >
              ✨ SPARKS IS FOR YOU
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Join thousands of individuals and families on their ADHD journey
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
