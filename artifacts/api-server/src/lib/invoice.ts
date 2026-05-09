import PDFDocument from "pdfkit";
import type { Order, OrderItem, ShippingAddress } from "@workspace/db";

export interface InvoiceData {
  order: Order;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  customerName: string;
  customerEmail: string | null;
}

const COMPANY = {
  name: "Vespera Atelier Pvt. Ltd.",
  address: "Mumbai, Maharashtra, India",
  email: "care@vespera.in",
  gstin: process.env.COMPANY_GSTIN || "27AAAAA0000A1Z5",
  hsn: process.env.PRODUCT_HSN_CODE || "4202",
  state: process.env.COMPANY_STATE || "Maharashtra",
};

const GST_RATE = 0.18;

function rupees(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const order = data.order;
    const total = parseFloat(order.totalAmount);
    const taxableValue = +(total / (1 + GST_RATE)).toFixed(2);
    const gstTotal = +(total - taxableValue).toFixed(2);
    const intraState = (data.shippingAddress?.state ?? "").trim().toLowerCase() === COMPANY.state.toLowerCase();
    const cgst = intraState ? +(gstTotal / 2).toFixed(2) : 0;
    const sgst = cgst;
    const igst = intraState ? 0 : gstTotal;

    // Header
    doc.fontSize(20).fillColor("#0A0A0A").text("VESPERA", { align: "center" });
    doc.fontSize(8).fillColor("#666").text("Sculptural Evening Minaudières", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(14).fillColor("#0A0A0A").text("Tax Invoice", { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(9).fillColor("#333");
    doc.text(`Invoice No: ${order.orderNumber}`, 50, doc.y);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 50);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50);
    if (order.razorpayPaymentId) doc.text(`Payment Ref: ${order.razorpayPaymentId}`, 50);
    doc.moveDown();

    // Seller / Buyer
    const startY = doc.y;
    doc.font("Helvetica-Bold").text("Seller", 50, startY);
    doc.font("Helvetica").fontSize(9)
      .text(COMPANY.name, 50)
      .text(COMPANY.address, 50)
      .text(`GSTIN: ${COMPANY.gstin}`, 50)
      .text(`Email: ${COMPANY.email}`, 50);

    doc.font("Helvetica-Bold").text("Bill To", 320, startY);
    doc.font("Helvetica").fontSize(9);
    if (data.shippingAddress) {
      doc.text(data.shippingAddress.fullName, 320)
        .text(data.shippingAddress.addressLine1, 320);
      if (data.shippingAddress.addressLine2) doc.text(data.shippingAddress.addressLine2, 320);
      doc.text(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}`, 320)
        .text(data.shippingAddress.country, 320)
        .text(`Phone: ${data.shippingAddress.phone}`, 320);
    } else {
      doc.text(data.customerName, 320);
      if (data.customerEmail) doc.text(data.customerEmail, 320);
    }
    doc.moveDown(2);

    // Items table
    const tableTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Description", 50, tableTop);
    doc.text("HSN", 280, tableTop, { width: 50 });
    doc.text("Qty", 330, tableTop, { width: 30, align: "right" });
    doc.text("Rate", 365, tableTop, { width: 70, align: "right" });
    doc.text("Amount", 440, tableTop, { width: 100, align: "right" });
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor("#ccc").stroke();
    doc.font("Helvetica");

    let y = tableTop + 22;
    for (const it of data.items) {
      doc.text(it.title, 50, y, { width: 220 });
      doc.text(COMPANY.hsn, 280, y, { width: 50 });
      doc.text(String(it.quantity), 330, y, { width: 30, align: "right" });
      doc.text(rupees(it.unitPrice), 365, y, { width: 70, align: "right" });
      doc.text(rupees(it.totalPrice), 440, y, { width: 100, align: "right" });
      y += 22;
    }

    doc.moveTo(50, y).lineTo(545, y).strokeColor("#ccc").stroke();
    y += 10;

    // Totals
    const labelX = 350, valueX = 440, valueW = 100;
    const rowsToShow: Array<[string, string]> = [["Taxable Value", rupees(taxableValue)]];
    if (parseFloat(order.discountAmount) > 0) rowsToShow.push(["Discount", `- ${rupees(order.discountAmount)}`]);
    if (parseFloat(order.loyaltyDiscountAmount) > 0) rowsToShow.push([`Loyalty (${order.loyaltyPointsRedeemed} pts)`, `- ${rupees(order.loyaltyDiscountAmount)}`]);
    if (parseFloat(order.giftWrapAmount) > 0) rowsToShow.push(["Gift Wrap", rupees(order.giftWrapAmount)]);
    if (parseFloat(order.shippingAmount) > 0) rowsToShow.push(["Shipping", rupees(order.shippingAmount)]);
    if (intraState) {
      rowsToShow.push(["CGST 9%", rupees(cgst)]);
      rowsToShow.push(["SGST 9%", rupees(sgst)]);
    } else {
      rowsToShow.push(["IGST 18%", rupees(igst)]);
    }

    for (const [label, val] of rowsToShow) {
      doc.fontSize(9).text(label, labelX, y);
      doc.text(val, valueX, y, { width: valueW, align: "right" });
      y += 16;
    }
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Grand Total", labelX, y + 4);
    doc.text(rupees(total), valueX, y + 4, { width: valueW, align: "right" });

    doc.font("Helvetica").fontSize(7).fillColor("#666");
    doc.text(
      "This is a computer-generated invoice; no signature required. Prices are inclusive of all taxes.",
      50,
      780,
      { width: 495, align: "center" }
    );

    doc.end();
  });
}
