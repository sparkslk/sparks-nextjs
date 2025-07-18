import React from "react";
import Image from "next/image";
import { Download, PlayCircle, Users } from "lucide-react";

const pdfMaterials = [
	{
		title: "ADHD Daily Routine Planner",
		author: "Sparks Team",
		size: "1.2 MB",
		description: "Structured daily planning template for ADHD children.",
	},
	{
		title: "Understanding ADHD - Parent Guide",
		author: "Sparks Team",
		size: "3.0 MB",
		description: "Comprehensive guide for parents new to ADHD diagnosis.",
	},
	{
		title: "Behavior Management Strategies",
		author: "Emma Washington",
		size: "2.8 MB",
		description: "Effective techniques for managing challenging behaviors.",
	},
];

const videos = [
	{
		title: "Morning Routines for ADHD Children",
		author: "Sparks Media Team",
		duration: "8 min",
		description: "Step-by-step advice for building effective morning routines.",
	},
	{
		title: "Communication Strategies with Teachers",
		author: "Sparks Education",
		duration: "12 min",
		description: "How to effectively communicate your child's needs to school.",
	},
	{
		title: "Mindfulness Techniques for Families",
		author: "Emma Washington",
		duration: "9 min",
		description: "Family-friendly mindfulness exercises and breathing techniques.",
	},
];

const supportGroups = [
	{
		title: "Colombo ADHD Parents Circle",
		location: "Colombo, Sri Lanka",
		duration: "60 min / weekly",
		description: "Weekly in-person support group for parents in Colombo area.",
	},
	{
		title: "SPARKS Online Community",
		location: "Online",
		duration: "24/7 access",
		description: "Online support for ADHD families across Sri Lanka.",
	},
];

type Guide = {
	id?: string | number;
	image_name?: string;
	title: string;
	summary: string;
	status?: string;
	views?: number | null;
	published_at?: string;
	updated_at?: string;
};

async function getGuides(): Promise<Guide[]> {
	const baseUrl =
		typeof window === "undefined"
			? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
			: "";
	const res = await fetch(`${baseUrl}/api/resources`, { next: { revalidate: 60 } });
	if (!res.ok) return [];
	return res.json();
}

export default async function ParentResourcesPage() {
	const guides = await getGuides();

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* Top Section: Title, Subtitle, Tabs */}
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold mb-2">Resource Library</h2>
				<p className="text-muted-foreground mb-6">
					Educational materials, videos, and support networks for ADHD families
				</p>
				<div className="flex justify-center gap-3">
					<button className="px-5 py-2 rounded-full font-medium bg-purple-600 text-white shadow-sm">
						All Resources
					</button>
					<button className="px-5 py-2 rounded-full font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100">
						PDF Materials
					</button>
					<button className="px-5 py-2 rounded-full font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100">
						Videos
					</button>
					<button className="px-5 py-2 rounded-full font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100">
						Support Groups
					</button>
				</div>
			</div>

			{/* Guides Section */}
			<div className="mb-10">
				<div className="flex gap-6 flex-col md:flex-row">
					{guides.map((guide: Guide, idx: number) => (
						<div
							key={guide.id || idx}
							className="bg-white rounded-xl shadow-lg border border-border flex-1 min-w-[320px] max-w-[400px] overflow-hidden flex flex-col"
						>
							<div className="relative h-48 w-full">
								<Image
									src={
										guide.image_name
											? `/images/${guide.image_name}`
											: "/images/default.png"
									}
									alt={guide.title}
									fill
									style={{ objectFit: "cover" }}
									className="rounded-t-xl"
								/>
								{guide.status === "Published" ? (
									<span className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
										Published
									</span>
								) : (
									<span className="absolute top-3 left-3 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
										Draft
									</span>
								)}
								{guide.views !== null && (
									<span className="absolute top-3 right-3 bg-white/80 text-gray-600 text-xs px-2 py-1 rounded-full">
										{guide.views} views
									</span>
								)}
							</div>
							<div className="p-5 flex-1 flex flex-col">
								<h3 className="font-semibold text-lg mb-2 text-gray-900">
									{guide.title}
								</h3>
								<p className="text-gray-700 text-sm mb-4 line-clamp-3">
									{guide.summary}
								</p>
								<div className="mt-auto text-xs text-muted-foreground">
									{guide.status === "Published" ? (
										<>Published: {guide.published_at?.slice(0, 10)}</>
									) : (
										<>Last edited: {guide.updated_at?.slice(0, 10)}</>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* PDF Materials Section */}
			<div className="mb-10">
				<h3 className="text-xl font-semibold mb-4">PDF Materials</h3>
				<div className="flex gap-6 flex-col md:flex-row">
					{pdfMaterials.map((item, idx) => (
						<div
							key={idx}
							className="bg-white rounded-xl shadow-lg border border-border flex-1 min-w-[320px] max-w-[400px] overflow-hidden flex flex-col"
						>
							<div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
								<Download className="h-12 w-12 text-purple-400" />
								<span className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
									PDF
								</span>
								<span className="absolute top-3 right-3 bg-white/80 text-gray-600 text-xs px-2 py-1 rounded-full">
									{item.size}
								</span>
							</div>
							<div className="p-5 flex-1 flex flex-col">
								<h3 className="font-semibold text-lg mb-2 text-gray-900">
									{item.title}
								</h3>
								<p className="text-gray-700 text-sm mb-4 line-clamp-3">
									{item.description}
								</p>
								<div className="mt-auto text-xs text-muted-foreground">
									By {item.author}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Videos Section */}
			<div className="mb-10">
				<h3 className="text-xl font-semibold mb-4">Educational Videos</h3>
				<div className="flex gap-6 flex-col md:flex-row">
					{videos.map((item, idx) => (
						<div
							key={idx}
							className="bg-white rounded-xl shadow-lg border border-border flex-1 min-w-[320px] max-w-[400px] overflow-hidden flex flex-col"
						>
							<div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
								<PlayCircle className="h-12 w-12 text-purple-400" />
								<span className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
									Video
								</span>
								<span className="absolute top-3 right-3 bg-white/80 text-gray-600 text-xs px-2 py-1 rounded-full">
									{item.duration}
								</span>
							</div>
							<div className="p-5 flex-1 flex flex-col">
								<h3 className="font-semibold text-lg mb-2 text-gray-900">
									{item.title}
								</h3>
								<p className="text-gray-700 text-sm mb-4 line-clamp-3">
									{item.description}
								</p>
								<div className="mt-auto text-xs text-muted-foreground">
									By {item.author}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Support Groups Section */}
			<div className="mb-10">
				<h3 className="text-xl font-semibold mb-4">Support Groups & Communities</h3>
				<div className="flex gap-6 flex-col md:flex-row">
					{supportGroups.map((item, idx) => (
						<div
							key={idx}
							className="bg-white rounded-xl shadow-lg border border-border flex-1 min-w-[320px] max-w-[400px] overflow-hidden flex flex-col"
						>
							<div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
								<Users className="h-12 w-12 text-purple-400" />
								<span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
									Group
								</span>
								<span className="absolute top-3 right-3 bg-white/80 text-gray-600 text-xs px-2 py-1 rounded-full">
									{item.duration}
								</span>
							</div>
							<div className="p-5 flex-1 flex flex-col">
								<h3 className="font-semibold text-lg mb-2 text-gray-900">
									{item.title}
								</h3>
								<p className="text-gray-700 text-sm mb-4 line-clamp-3">
									{item.description}
								</p>
								<div className="mt-auto text-xs text-muted-foreground">
									{item.location}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
