import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Create client with API key
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
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

        // build gemini prompt
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
- Professional formatting and layout
- Finishing and assembly details
`;

        // call Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        // Extract text from response
        const output = response.candidates?.[0]?.content?.parts?.[0]?.text || "No pattern generated.";

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
        return NextResponse.json(
            {
                success: false,
                message: "Pattern generation failed. Please try again.",
            },
            { status: 500 }
        );
    }
}
