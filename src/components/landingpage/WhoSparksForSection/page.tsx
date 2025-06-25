export default function WhoSparksForSection() {
    const targetAudience = [
        "Individuals with ADHD seeking comprehensive support",
        "Families looking for guidance and management tools",
        "Healthcare professionals treating ADHD patients",
        "Educators working with ADHD students",
        "Support groups and community organizations",
        "Anyone interested in understanding ADHD better"
    ];

    return (
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-purple-600 to-primary text-white rounded-2xl sm:rounded-3xl my-8 sm:my-16 mx-4 sm:mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 px-2">Who&apos;s SPARKS For?</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {targetAudience.map((item, index) => (
                    <div key={index} className="flex items-start sm:items-center space-x-3 sm:space-x-4 text-base sm:text-lg px-2">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-relaxed">{item}</span>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8 sm:mt-12 px-4">
                <div className="inline-block px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-yellow-400 text-primary rounded-full font-bold text-base sm:text-lg md:text-xl border-2 sm:border-4 border-yellow-300">
                    SPARKS IS FOR YOU
                </div>
            </div>
        </section>
    );
}
