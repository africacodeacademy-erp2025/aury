/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import { PatternPDFData } from '@/types';

export async function generatePatternPDF(data: PatternPDFData): Promise<Buffer> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    for (const line of lines) {
      checkPageBreak(lineHeight);
      pdf.text(line, x, currentY);
      currentY += lineHeight;
      yPosition = currentY;
    }
    
    return currentY;
  };

  // Page 1: Cover Page
  // Background color
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header with branding
  pdf.setFillColor(21, 93, 252);
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  // Logo area: embed aury-logo.png from public folder
  // Note: jsPDF requires image data as base64 or data URL.
  // We'll fetch the image and convert it to base64.
  try {
    // Adjust the path as needed for your environment
    const logoUrl = `${process.cwd()}/public/aury-logo.png`;
    // Read image as base64
    const fs = await import('fs/promises');
    const imageBuffer = await fs.readFile(logoUrl);
    const imageBase64 = imageBuffer.toString('base64');
    // Add image to PDF
    pdf.addImage(
      `data:image/png;base64,${imageBase64}`,
      'PNG',
      margin, 15, 30, 30
    );
  } catch (err) {
    console.log(err)
    // Fallback: draw placeholder if image fails
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, 15, 30, 30, 'F');
    pdf.setTextColor(21, 93, 252);
    pdf.setFontSize(16);
    pdf.text('AURY', margin + 5, 35);
  }

  // Title
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text('CROCHET PATTERN', pageWidth / 2, 40, { align: 'center' });

  // Pattern name
  yPosition = 80;
  pdf.setFontSize(24);
  pdf.setTextColor(51, 51, 51);
  pdf.text(data.patternName, pageWidth / 2, yPosition, { align: 'center' });

  // Pattern details box
  yPosition = 110;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(229, 231, 235);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 80, 'FD');

  // Pattern details
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(75, 85, 99);
  
  const details = [
    `Project Type: ${data.patternData?.projectType || 'Not specified'}`,
    `Difficulty Level: ${data.patternData?.difficultyLevel || 'Not specified'}`,
    `Yarn Weight: ${data.patternData?.yarnWeight || 'Not specified'}`,
    `Hook Size: ${data.patternData?.hookSize || 'Not specified'}`,
    `Size/Dimensions: ${data.patternData?.sizeDimensions || 'Not specified'}`,
  ];

  details.forEach((detail) => {
    pdf.text(detail, margin + 10, yPosition);
    yPosition += 12;
  });

  // Customer information
  yPosition = 220;
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
  
  yPosition += 15;
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Purchased by: ${data.customerName}`, margin + 10, yPosition);
  yPosition += 8;
  pdf.text(`Email: ${data.customerEmail}`, margin + 10, yPosition);
  yPosition += 8;
  pdf.text(`Purchase Date: ${data.purchaseDate}`, margin + 10, yPosition);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  pdf.text(`© ${new Date().getFullYear()} Aury Marketplace. All rights reserved.`, 
    pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Page 2: Pattern Content
  pdf.addPage();
  yPosition = margin;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(34, 139, 104);
  pdf.text(data.patternName, margin, yPosition);
  yPosition += 15;

  // Add pattern image if available
  if (data.productImage) {
    try {
      // Support both base64/data URL and file path
      let imageData: string;
      if (data.productImage.startsWith('data:image/')) {
        imageData = data.productImage;
      } else if (data.productImage.startsWith('http://') || data.productImage.startsWith('https://')) {
        // Fetch image from remote URL and convert to base64
        const res = await fetch(data.productImage);
        if (!res.ok) throw new Error('Failed to fetch image from URL');
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Try to detect image type from extension
        const ext = data.productImage.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'png'
            ? 'image/png'
            : 'image/png';
        imageData = `data:${mimeType};base64,${buffer.toString('base64')}`;
      } else {
        // Assume it's a file path, read and convert to base64
        const fs = await import('fs/promises');
        const imageBuffer = await fs.readFile(data.productImage);
        // Try to detect image type from extension
        const ext = data.productImage.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'png'
            ? 'image/png'
            : 'image/png';
        imageData = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      }
      // Add image to PDF
      // Determine image format for addImage
      const format = imageData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
      pdf.addImage(
        imageData,
        format,
        margin, yPosition, 60, 60
      );
      yPosition += 70;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      yPosition += 10;
    }
  }

  // Pattern content
  pdf.setFontSize(14);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Pattern Instructions', margin, yPosition);
  yPosition += 15;

  // Add pattern content with proper formatting
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  
  // Safety guard for pattern content
  const patternContent = data.patternContent || 'Pattern content not available.';
  const patternLines = patternContent.split('\n');
  
  for (const line of patternLines) {
    if (line.trim() === '') {
      yPosition += 5;
      continue;
    }
    
    checkPageBreak(lineHeight + 5);
    
    // Check if line is a header (contains certain keywords)
    if (line.match(/^(Materials|Gauge|Instructions|Abbreviations|Notes):/i)) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 139, 104);
    } else {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
    }
    
    yPosition = addWrappedText(line, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 3;
  }

  // Footer on last page
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  pdf.text('Happy Crocheting! 🧶', pageWidth / 2, pageHeight - 20, { align: 'center' });
  pdf.text(`© ${new Date().getFullYear()} Aury Marketplace. All rights reserved.`, 
    pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Return PDF as buffer
  const pdfOutput = pdf.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

export async function generateInvoicePDF(orderData: any): Promise<Buffer> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Header with branding (similar to the invoice example)
  pdf.setFillColor(34, 139, 104);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Company name
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text('AURY', margin, 30);
  pdf.setFontSize(12);
  pdf.text('MARKETPLACE', margin, 40);

  // Invoice title
  pdf.setFontSize(20);
  pdf.setTextColor(51, 51, 51);
  pdf.text('INVOICE', pageWidth - margin, 30, { align: 'right' });

  // Continue with invoice content...
  // (This would be implemented similarly to the pattern PDF)

  const pdfOutput = pdf.output('arraybuffer');
  return Buffer.from(pdfOutput);
}