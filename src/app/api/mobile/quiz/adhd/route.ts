import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// ADHD Type Determination based on DSM-5 criteria
type AdhdType = "PREDOMINANTLY_INATTENTIVE" | "PREDOMINANTLY_HYPERACTIVE_IMPULSIVE" | "COMBINED" | "LOW_LIKELIHOOD" | "NO_ADHD";

interface AdhdScoreCalculation {
  inattentionScore: number;
  hyperactivityScore: number;
  totalScore: number;
  adhdType: AdhdType;
  interpretation: string;
  recommendations: string[];
  [key: string]: string | number | string[];
}

/**
 * Calculate ADHD scores based on Quiz.md algorithm
 */
function calculateAdhdScore(responses: Record<string, string>): AdhdScoreCalculation {
  // Scoring: Never=0, Rarely=1, Sometimes=2, Often=3, Very Often=4
  const scoreMap: Record<string, number> = {
    A: 0, // Never
    B: 1, // Rarely
    C: 2, // Sometimes
    D: 3, // Often
    E: 4, // Very Often
  };

  // Calculate Inattention Score (Questions 1-9)
  let inattentionScore = 0;
  for (let i = 1; i <= 9; i++) {
    const response = responses[`q${i}`];
    inattentionScore += scoreMap[response] || 0;
  }

  // Calculate Hyperactivity-Impulsivity Score (Questions 10-18)
  let hyperactivityScore = 0;
  for (let i = 10; i <= 18; i++) {
    const response = responses[`q${i}`];
    hyperactivityScore += scoreMap[response] || 0;
  }

  const totalScore = inattentionScore + hyperactivityScore;

  // Determine ADHD Type based on Quiz.md criteria
  let adhdType: AdhdType;
  let interpretation: string;
  const recommendations: string[] = [];

  // Check impairment and childhood onset (Q19 and Q20)
  const hasSignificantImpairment = responses.q19 === "C" || responses.q19 === "D";
  const hasChildhoodOnset = responses.q20 === "C" || responses.q20 === "D";

  if (totalScore < 14) {
    adhdType = "LOW_LIKELIHOOD";
    interpretation = "Low likelihood of ADHD. Your responses suggest minimal ADHD symptoms.";
    recommendations.push(
      "If you still have concerns about attention or focus, consider discussing them with a healthcare provider.",
      "Maintaining healthy lifestyle habits (sleep, exercise, nutrition) can support overall cognitive function."
    );
  } else if (!hasSignificantImpairment || !hasChildhoodOnset) {
    adhdType = "NO_ADHD";
    interpretation = "While you show some symptoms, the diagnostic criteria for ADHD are not fully met (requires significant impairment in multiple settings and childhood onset before age 12).";
    recommendations.push(
      "Consider discussing your symptoms with a healthcare provider to rule out other conditions.",
      "Symptoms may be related to stress, anxiety, depression, or other factors that can mimic ADHD."
    );
  } else if (inattentionScore >= 15 && hyperactivityScore >= 15) {
    adhdType = "COMBINED";
    interpretation = "High likelihood of ADHD - Combined Type. You show significant symptoms of both inattention and hyperactivity-impulsivity. This is the most common presentation of ADHD.";
    recommendations.push(
      "Seek professional evaluation from a qualified healthcare provider (Psychiatrist or Clinical Psychologist).",
      "Treatment options may include medication, cognitive behavioral therapy (CBT), and coaching.",
      "Consider workplace or academic accommodations to support your needs.",
      "ADHD coaching and organizational strategies can be very helpful."
    );
  } else if (inattentionScore >= 15) {
    adhdType = "PREDOMINANTLY_INATTENTIVE";
    interpretation = "High likelihood of ADHD - Predominantly Inattentive Type. You primarily experience difficulties with attention, focus, and organization.";
    recommendations.push(
      "Seek professional evaluation from a qualified healthcare provider (Psychiatrist or Clinical Psychologist).",
      "Treatment may include medication, therapy focusing on organizational skills, and environmental modifications.",
      "Time management tools, planners, and reminders can be beneficial.",
      "Consider discussing accommodations at work or school."
    );
  } else if (hyperactivityScore >= 15) {
    adhdType = "PREDOMINANTLY_HYPERACTIVE_IMPULSIVE";
    interpretation = "High likelihood of ADHD - Predominantly Hyperactive-Impulsive Type. You primarily experience restlessness, impulsivity, and difficulty with self-regulation.";
    recommendations.push(
      "Seek professional evaluation from a qualified healthcare provider (Psychiatrist or Clinical Psychologist).",
      "Treatment may include medication, behavioral therapy, and impulse control strategies.",
      "Regular physical exercise can help manage hyperactivity symptoms.",
      "Mindfulness and stress reduction techniques may be beneficial."
    );
  } else {
    // Score between 14-23 but doesn't meet full criteria for any subtype
    adhdType = "NO_ADHD";
    interpretation = "Possible ADHD symptoms present, but below diagnostic threshold. Professional evaluation is recommended to assess whether symptoms meet clinical criteria.";
    recommendations.push(
      "Consider professional evaluation to rule out ADHD and other conditions.",
      "Your symptoms may be situational or related to other factors (stress, sleep issues, etc.).",
      "Keep a symptom journal to track patterns and triggers."
    );
  }

  return {
    inattentionScore,
    hyperactivityScore,
    totalScore,
    adhdType,
    interpretation,
    recommendations,
  };
}

/**
 * GET: Retrieve user's ADHD quiz submission
 */
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

    // Find existing ADHD quiz submission
    const submission = await prisma.quizSubmission.findFirst({
      where: {
        userId: payload.userId,
        quizType: "ADHD",
        completionStatus: "COMPLETED",
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    if (!submission) {
      return NextResponse.json({
        hasCompleted: false,
        message: "No ADHD quiz submission found",
      });
    }

    return NextResponse.json({
      hasCompleted: true,
      submission: {
        id: submission.id,
        completedAt: submission.completedAt,
        adhdScore: submission.adhdScore,
        responses: submission.responses,
      },
    });
  } catch (error) {
    console.error("Error fetching ADHD quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Submit completed ADHD quiz
 */
export async function POST(request: NextRequest) {
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

    const data = await request.json();
    const { responses, sessionId } = data;

    // Validate that all 20 questions are answered
    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "Invalid responses format" },
        { status: 400 }
      );
    }

    const requiredQuestions = Array.from({ length: 20 }, (_, i) => `q${i + 1}`);
    const missingQuestions = requiredQuestions.filter((q) => !responses[q]);

    if (missingQuestions.length > 0) {
      return NextResponse.json(
        {
          error: "Incomplete quiz",
          missingQuestions,
        },
        { status: 400 }
      );
    }

    // Calculate ADHD scores
    const scoreResult = calculateAdhdScore(responses);

    // Check if user already has a completed ADHD quiz
    const existingSubmission = await prisma.quizSubmission.findFirst({
      where: {
        userId: payload.userId,
        quizType: "ADHD",
        completionStatus: "COMPLETED",
      },
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.quizSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          responses,
          adhdScore: scoreResult,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new submission
      submission = await prisma.quizSubmission.create({
        data: {
          userId: payload.userId,
          sessionId: sessionId || `session-${Date.now()}`,
          quizType: "ADHD",
          responses,
          currentStep: 20,
          completionStatus: "COMPLETED",
          adhdScore: scoreResult,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: {
        id: submission.id,
        inattentionScore: scoreResult.inattentionScore,
        hyperactivityScore: scoreResult.hyperactivityScore,
        totalScore: scoreResult.totalScore,
        adhdType: scoreResult.adhdType,
        interpretation: scoreResult.interpretation,
        recommendations: scoreResult.recommendations,
        completedAt: submission.completedAt,
      },
      disclaimer:
        "This screening tool is for educational purposes only and is NOT a diagnostic tool. Only a qualified healthcare professional can accurately diagnose ADHD. If your results suggest ADHD, please consult a Clinical Psychologist or Psychiatrist for a comprehensive evaluation.",
    });
  } catch (error) {
    console.error("Error submitting ADHD quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
