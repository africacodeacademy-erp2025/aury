/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getProductById } from "@/lib/actions/product.action";
import { generatePatternPDF } from "@/lib/utils/pdf";
import { sendPatternPurchaseEmail } from "@/lib/utils/email";
import { PatternPDFData } from "@/types";

export async function POST(request: Request) {
  try {
    const { productId, customerEmail, customerName } = await request.json();

    // Validation
    if (!productId || !customerEmail || !customerName) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get product details
    const productResult = await getProductById(productId);
    if (!productResult.success || !productResult.product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const product = productResult.product;

    // Check if it's a pattern product
    if (product.category !== 'crochet pattern') {
      return NextResponse.json(
        { success: false, message: "This product is not a pattern - skipping delivery" },
        { status: 200 } // Return 200 since this is expected behavior for non-pattern products
      );
    }

    // Prepare PDF data with safety guards
    const patternContent = (product as any).patternContent || 
      `Pattern: ${product.name}\n\nThis is a ${product.difficulty || 'beginner'} level ${product.category}.\n\nPattern content is being processed and will be available soon.`;
    
    const patternData = (product as any).patternData || {
      projectType: 'crochet project',
      difficultyLevel: product.difficulty || 'beginner',
      yarnWeight: 'Not specified',
      hookSize: 'Not specified',
      sizeDimensions: 'Not specified',
    };

    const pdfData: PatternPDFData = {
      patternName: product.name,
      customerName,
      customerEmail,
      purchaseDate: new Date().toLocaleDateString(),
      patternContent,
      productImage: product.imageUrl || undefined,
      patternData,
    };

    // Generate PDF
    const pdfBuffer = await generatePatternPDF(pdfData);

    // Send email with PDF attachment
    const emailResult = await sendPatternPurchaseEmail(
      customerEmail,
      customerName,
      product.name,
      pdfBuffer
    );

    if (!emailResult.success) {
      console.error("Failed to send pattern email:", emailResult.message);
      return NextResponse.json(
        { success: false, message: "Failed to send pattern email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pattern sent successfully to customer email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pattern delivery error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to deliver pattern. Please try again.",
      },
      { status: 500 }
    );
  }
}