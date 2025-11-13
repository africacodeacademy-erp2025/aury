import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Create client with API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
    return NextResponse.json(
        { message: "TEST API ENDPOINT REACHED", success: true },
        { status: 200 }
    );
}

export async function POST(request: Request) {
    try {
        const { patternName, projectType, difficultyLevel, yarnWeight, hookSize, sizeDimensions, customInstructions } = await request.json();

        // validation
        if (
            !patternName?.trim() ||
            !projectType?.trim() ||
            !difficultyLevel?.trim() ||
            !yarnWeight?.trim() ||
            !hookSize?.trim() ||
            !sizeDimensions?.trim()
        ) {
            return NextResponse.json(
                { success: false, message: "All fields required." },
                { status: 400 }
            );
        }

        // auth check
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated." },
                { status: 401 }
            );
        }
        // build OpenAI prompt
        const prompt = `Generate a professional crochet pattern with the following details:

Pattern Name: ${patternName}
Project Type: ${projectType}
Difficulty Level: ${difficultyLevel}
Yarn Weight: ${yarnWeight}
Hook Size: ${hookSize}
Size/Dimensions: ${sizeDimensions}
Custom Instructions: ${customInstructions || "None"}

Include:
- Materials list (with yarn requirements and amounts)
- Gauge and tension info
- Step-by-step instructions with stitch counts
`;
        // call OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // Extract text from response
        const output = response.choices?.[0]?.message?.content || "No pattern generated.";

        return NextResponse.json(
            {
                success: true,
                message: "Pattern generated successfully.",
                pattern: output,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Pattern generation error:", error);
        console.log("Pattern generation error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Pattern generation failed. Please try again.",
                // message: "Pattern generation failed. Please try again.",
            },
            { status: 500 }
        );
    }
}
