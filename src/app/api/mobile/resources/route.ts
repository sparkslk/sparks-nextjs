import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";

// Get ADHD resources for mobile app
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);
    
    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Static resources data - in a real app, this might come from a database
    const resources = {
      educational: [
        {
          id: "1",
          title: "Understanding ADHD",
          description: "Learn about the basics of ADHD, its symptoms, and how it affects daily life",
          category: "education",
          type: "article",
          url: "/resources/understanding-adhd",
          icon: "brain"
        },
        {
          id: "2",
          title: "ADHD in Adults",
          description: "How ADHD presents differently in adults and strategies for management",
          category: "education",
          type: "article",
          url: "/resources/adhd-adults",
          icon: "user"
        },
        {
          id: "3",
          title: "ADHD Myths and Facts",
          description: "Debunking common misconceptions about ADHD",
          category: "education",
          type: "article",
          url: "/resources/myths-facts",
          icon: "info"
        }
      ],
      tools: [
        {
          id: "4",
          title: "Symptom Tracker",
          description: "Track your ADHD symptoms over time to identify patterns",
          category: "tool",
          type: "interactive",
          action: "SYMPTOM_TRACKER",
          icon: "chart"
        },
        {
          id: "5",
          title: "Focus Timer",
          description: "Pomodoro-style timer to help maintain focus during tasks",
          category: "tool",
          type: "interactive",
          action: "FOCUS_TIMER",
          icon: "clock"
        },
        {
          id: "6",
          title: "Medication Reminder",
          description: "Set reminders for your ADHD medications",
          category: "tool",
          type: "interactive",
          action: "MED_REMINDER",
          icon: "pill"
        },
        {
          id: "7",
          title: "Daily Planner",
          description: "ADHD-friendly daily planning tool",
          category: "tool",
          type: "interactive",
          action: "DAILY_PLANNER",
          icon: "calendar"
        }
      ],
      supportGroups: [
        {
          id: "8",
          title: "Adult ADHD Support Group",
          description: "Connect with other adults managing ADHD",
          category: "support",
          type: "group",
          schedule: "Every Tuesday, 7 PM",
          location: "Online",
          icon: "group"
        },
        {
          id: "9",
          title: "ADHD Parents Network",
          description: "Support for parents of children with ADHD",
          category: "support",
          type: "group",
          schedule: "Monthly, First Sunday",
          location: "Community Center",
          icon: "family"
        }
      ],
      emergencyContacts: [
        {
          id: "10",
          title: "Crisis Helpline",
          description: "24/7 support for mental health emergencies",
          phone: "988",
          category: "emergency",
          available: "24/7",
          icon: "phone-emergency"
        },
        {
          id: "11",
          title: "ADHD Support Line",
          description: "Speak with ADHD specialists",
          phone: "1-800-233-4050",
          category: "emergency",
          available: "Mon-Fri, 9 AM - 5 PM EST",
          icon: "phone"
        }
      ],
      exercises: [
        {
          id: "12",
          title: "Mindfulness Meditation",
          description: "5-minute guided meditation for ADHD minds",
          category: "exercise",
          duration: "5 minutes",
          difficulty: "beginner",
          icon: "meditation"
        },
        {
          id: "13",
          title: "Focus Breathing",
          description: "Breathing exercises to improve concentration",
          category: "exercise",
          duration: "3 minutes",
          difficulty: "beginner",
          icon: "wind"
        },
        {
          id: "14",
          title: "Body Scan",
          description: "Progressive relaxation technique for hyperactivity",
          category: "exercise",
          duration: "10 minutes",
          difficulty: "intermediate",
          icon: "body"
        }
      ],
      tips: [
        {
          id: "15",
          title: "Daily Tips",
          description: "Practical tips for managing ADHD symptoms",
          tips: [
            "Set multiple alarms for important tasks",
            "Use color-coding for organization",
            "Break large tasks into smaller steps",
            "Keep a consistent daily routine",
            "Use visual reminders and sticky notes"
          ]
        }
      ]
    };

    // Get user's saved/favorite resources (in a real app)
    const savedResourceIds = ["1", "4", "5"]; // Mock data

    return NextResponse.json({
      resources,
      savedResourceIds,
      categories: [
        { id: "education", name: "Educational", count: resources.educational.length },
        { id: "tools", name: "Tools", count: resources.tools.length },
        { id: "support", name: "Support Groups", count: resources.supportGroups.length },
        { id: "emergency", name: "Emergency", count: resources.emergencyContacts.length },
        { id: "exercises", name: "Exercises", count: resources.exercises.length }
      ]
    });

  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}