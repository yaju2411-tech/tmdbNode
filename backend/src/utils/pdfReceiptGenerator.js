import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generateReceiptPDFBuffer = async (receipt) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Dark Theme Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.04, 0.04, 0.04), // #0a0a0a
  });

  // Top Red Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: rgb(0.9, 0.04, 0.08), // TMDB Red #e50914
  });

  // Header Title & Logo Text
  page.drawText("TMDB VIP", {
    x: 40,
    y: height - 52,
    size: 26,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("OFFICIAL TAX RECEIPT", {
    x: width - 230,
    y: height - 48,
    size: 15,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Movies & TV Streaming Pass", {
    x: 40,
    y: height - 74,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText("STATUS: PAID & VERIFIED", {
    x: width - 230,
    y: height - 70,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.95, 0.4),
  });

  let y = height - 135;

  // Section Card Helper
  const drawCard = (title, items) => {
    const cardHeight = 30 + items.length * 22;
    page.drawRectangle({
      x: 40,
      y: y - cardHeight,
      width: width - 80,
      height: cardHeight,
      color: rgb(0.08, 0.08, 0.08),
      borderColor: rgb(0.18, 0.18, 0.18),
      borderWidth: 1,
    });

    page.drawText(title.toUpperCase(), {
      x: 55,
      y: y - 22,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.9, 0.04, 0.08),
    });

    let itemY = y - 44;
    items.forEach(([label, val, isCode]) => {
      page.drawText(label, {
        x: 55,
        y: itemY,
        size: 10,
        font: fontHelvetica,
        color: rgb(0.65, 0.65, 0.65),
      });

      page.drawText(String(val || "N/A"), {
        x: 220,
        y: itemY,
        size: 10,
        font: isCode ? fontCourier : fontHelveticaBold,
        color: isCode ? rgb(0.2, 0.95, 0.4) : rgb(1, 1, 1),
      });

      itemY -= 22;
    });

    y -= cardHeight + 20;
  };

  // Customer Details Section
  drawCard("Customer Details", [
    ["Customer Name:", receipt.uname || "Subscriber"],
    ["Customer Email:", receipt.uemail || "N/A"],
    [
      "Date of Issue:",
      new Date(receipt.paid_at || Date.now()).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ],
  ]);

  // Transaction Summary Section
  drawCard("Transaction Summary", [
    ["Receipt Number:", receipt.receipt_number, true],
    ["Razorpay Order ID:", receipt.order_id || "N/A"],
    ["Razorpay Payment ID:", receipt.payment_id || "N/A"],
    ["Plan / Item:", receipt.content_title || "TMDB VIP Pass"],
    ["Content Type:", (receipt.content_type || "subscription").toUpperCase()],
  ]);

  // Total Paid Card
  page.drawRectangle({
    x: 40,
    y: y - 60,
    width: width - 80,
    height: 60,
    color: rgb(0.12, 0.12, 0.12),
    borderColor: rgb(0.9, 0.04, 0.08),
    borderWidth: 2,
  });

  page.drawText("TOTAL AMOUNT PAID", {
    x: 55,
    y: y - 35,
    size: 13,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`INR ₹${receipt.amount || 0}`, {
    x: width - 180,
    y: y - 37,
    size: 18,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.95, 0.4),
  });

  // Footer Text
  page.drawText("Thank you for subscribing to TMDB Movies & TV Shows!", {
    x: 40,
    y: 50,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText("This is an official computer-generated tax invoice. No physical signature required.", {
    x: 40,
    y: 35,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.35, 0.35, 0.35),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
