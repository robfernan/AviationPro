import jsPDF from 'jspdf';
import { AircraftProfile } from './indexedDB';

interface BriefingData {
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  aircraftType: string;
  nNumber: string;
  pilot: string;
  checkpoints?: Array<{
    airport?: string;
    latitude?: string;
    longitude?: string;
    distance?: string;
    heading?: string;
    time?: string;
    fuel?: string;
  }>;
  metar?: string;
  taf?: string;
  notams?: string[];
  fuelPlan?: {
    totalDistance: string;
    totalTime: string;
    fuelBurned: string;
    reserve: string;
  };
  weightBalance?: {
    rampWeight: string;
    takeoffWeight: string;
    cg: string;
  };
}

export const generateBriefingPDF = (data: BriefingData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;
  const lineHeight = 6;
  const margin = 10;

  // Helper function to add text with wrapping
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize / 2.8);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('FLIGHT BRIEFING', margin, yPosition);
  yPosition += 8;

  // Flight Info Header
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  const flightInfoWidth = (pageWidth - margin * 2) / 2;
  const col1X = margin;
  const col2X = margin + flightInfoWidth;

  doc.text(`Date: ${data.date}`, col1X, yPosition);
  doc.text(`Pilot: ${data.pilot}`, col2X, yPosition);
  yPosition += lineHeight;

  doc.text(`From: ${data.departureAirport}`, col1X, yPosition);
  doc.text(`Aircraft: ${data.aircraftType}`, col2X, yPosition);
  yPosition += lineHeight;

  doc.text(`To: ${data.arrivalAirport}`, col1X, yPosition);
  doc.text(`N-Number: ${data.nNumber}`, col2X, yPosition);
  yPosition += 8;

  // Route/Checkpoints
  if (data.checkpoints && data.checkpoints.length > 0) {
    checkNewPage(30);
    doc.setFont(undefined, 'bold');
    doc.text('ROUTE', margin, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    const checkpointWidth = pageWidth - margin * 2;
    doc.text('Airport/Fix', margin, yPosition);
    doc.text('Distance', margin + 25, yPosition);
    doc.text('Heading', margin + 50, yPosition);
    doc.text('Time', margin + 75, yPosition);
    yPosition += 4;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;

    for (const checkpoint of data.checkpoints) {
      checkNewPage(5);
      doc.text(checkpoint.airport || '', margin, yPosition);
      doc.text(checkpoint.distance || '', margin + 25, yPosition);
      doc.text(checkpoint.heading || '', margin + 50, yPosition);
      doc.text(checkpoint.time || '', margin + 75, yPosition);
      yPosition += 4;
    }

    yPosition += 2;
  }

  // Weather
  if (data.metar || data.taf || data.notams?.length) {
    checkNewPage(30);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('WEATHER & NOTAMS', margin, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    if (data.metar) {
      doc.text('METAR:', margin, yPosition);
      yPosition = addWrappedText(data.metar, margin + 2, yPosition + 4, pageWidth - margin * 2 - 2, 8) + 2;
    }

    if (data.taf) {
      checkNewPage(15);
      doc.text('TAF:', margin, yPosition);
      yPosition = addWrappedText(data.taf, margin + 2, yPosition + 4, pageWidth - margin * 2 - 2, 8) + 2;
    }

    if (data.notams && data.notams.length > 0) {
      checkNewPage(15);
      doc.text('NOTAMs:', margin, yPosition);
      yPosition += 4;
      for (const notam of data.notams) {
        checkNewPage(5);
        yPosition = addWrappedText(`• ${notam}`, margin + 2, yPosition, pageWidth - margin * 2 - 4, 8) + 1;
      }
    }

    yPosition += 2;
  }

  // Fuel Plan
  if (data.fuelPlan) {
    checkNewPage(20);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('FUEL PLAN', margin, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Total Distance: ${data.fuelPlan.totalDistance}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Time: ${data.fuelPlan.totalTime}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Fuel Burned: ${data.fuelPlan.fuelBurned}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Reserve (45 min): ${data.fuelPlan.reserve}`, margin, yPosition);
    yPosition += 6;
  }

  // Weight & Balance
  if (data.weightBalance) {
    checkNewPage(15);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('WEIGHT & BALANCE', margin, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Ramp Weight: ${data.weightBalance.rampWeight}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Takeoff Weight: ${data.weightBalance.takeoffWeight}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`CG: ${data.weightBalance.cg}`, margin, yPosition);
    yPosition += 6;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  return doc;
};
