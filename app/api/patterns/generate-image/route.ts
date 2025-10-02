/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { projectType, patternName, description } = await request.json();

    if (!projectType?.trim() || !patternName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Project type and pattern name are required." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    // Build prompt for OpenAI image generation
    const imagePrompt = `A beautiful, professional photograph of a ${projectType} made with crochet, styled for marketplace listing. ${description || ""}. High quality, well-lit, attractive product photography.`;

    // Generate via OpenAI
    const openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    const openaiData = await openaiResp.json();
    console.log("OpenAI response:", openaiData);
    const imageUrlTemp = openaiData.data?.[0]?.url;
    if (!imageUrlTemp) {
      throw new Error("OpenAI did not return an image URL");
    }

    // Fetch the generated image buffer
    const imgResp = await fetch(imageUrlTemp);
    const buf = await imgResp.arrayBuffer();
    const buffer = Buffer.from(buf);

    // Convert to Base64 string for ImgBB
    const base64Image = buffer.toString("base64");

    // Upload to ImgBB
    const formData = new FormData();
    formData.append("key", process.env.IMGBB_API_KEY!);
    formData.append("image", base64Image);
    formData.append("name", `${patternName}-${Date.now()}`); // optional

    const imgbbResp = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const imgbbData = await imgbbResp.json();
    if (!imgbbData.success) {
      console.error("ImgBB upload failed", imgbbData);
      throw new Error("ImgBB upload failed");
    }

    const finalUrl = imgbbData.data.display_url || imgbbData.data.url;

    return NextResponse.json(
      {
        success: true,
        message: "Image generated and uploaded successfully.",
        imageUrl: finalUrl,
        prompt: imagePrompt,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Image route error:", err);
    return NextResponse.json(
      { success: false, message: "Image generation/upload failed." },
      { status: 500 }
    );
  }
}
