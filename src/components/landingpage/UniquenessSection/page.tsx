import { Card } from "@/components/ui/card";

export default function UniquenessSection() {
    const existingProjects = [
        "Focused on single-function apps (mood trackers, appointment schedulers)",
        "Designed with generic, global audiences in mind",
        "No specialized ADHD focus or local context"
    ];

    const sparksApproach = [
        "Comprehensive platform covering assessment, management, education, and community",
        "Features and content aligned with Sri Lankan education and healthcare systems",
        "Specialized ADHD management tools designed for local needs"
    ];

    return (
        <section className="py-8 sm:py-12 md:py-16 px-4">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                    Our Uniqueness
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2 leading-relaxed">
                    What makes SPARKS different from existing solutions
                </p>
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
                <Card className="p-4 sm:p-6 md:p-8 bg-red-50 border-red-200">
                    <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3 sm:mb-4">Existing Projects</h3>
                    <ul className="space-y-2 sm:space-y-3 text-red-700">
                        {existingProjects.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                                <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></span>
                                <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-4 sm:p-6 md:p-8 bg-green-50 border-green-200">
                    <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">SPARKS Approach</h3>
                    <ul className="space-y-2 sm:space-y-3 text-green-700">
                        {sparksApproach.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></span>
                                <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </section>
    );
}
