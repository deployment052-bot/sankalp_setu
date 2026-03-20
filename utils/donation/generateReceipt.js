const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = (donation) => {
  return new Promise((resolve, reject) => {
    try {
      const dir = "receipts";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `receipt_${donation._id}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      if (fs.existsSync("logo/logo.png")) {
        doc.image("logo/logo.png", 70, 40, { width: 60 });
      }

      doc
        .font("Times-Bold")
        .fontSize(16)
        .text("SANKALP SETU FOUNDATION", { align: "center" })
        .moveDown(0.3);

      doc
        .font("Times-Roman")
        .fontSize(10)
        .text("Regd Under S.R Act 21, 1860 | Regd No: S000229", { align: "center" })
        .text("Registered Office: Janki Palace, Near Nand Garden,", { align: "center" })
        .text("Kachhua Road Nandlal Chapra, Patna Bihar 80003", { align: "center" })
        .text("Email: sankalpsetufoundation@gmail.com | Mob: 9211621996", {
          align: "center",
        });

      doc.moveDown(1);

      // Divider
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown(1);

      
      doc
        .font("Times-Roman")
        .fontSize(11)
        .text(`Receipt No: ${donation._id}`, {
          align: "right",
        });

      doc.moveDown(0.5);

     
      doc
        .font("Times-Bold")
        .fontSize(14)
        .text("DONATION RECEIPT", {
          align: "center",
          underline: true,
        });

      doc.moveDown(1.5);

      const leftX = 70;
      const rightX = 300;
      let y = doc.y;

      doc.fontSize(12);

      doc.font("Times-Roman").text("Received with thanks from:", leftX, y);
      doc.font("Times-Bold").text(donation.name || "-", rightX, y);

      y += 26;
      doc.font("Times-Roman").text("The sum of Rupees:", leftX, y);
      doc.font("Times-Bold").text(`${donation.amount || 0}/-`, rightX, y);

      y += 26;
      doc.font("Times-Roman").text("Towards:", leftX, y);
      doc.font("Times-Bold").text(donation.purpose || "Donation", rightX, y);

      y += 26;
      doc.font("Times-Roman").text("Payment Method:", leftX, y);
      doc.font("Times-Bold").text(donation.paymentMode || "ONLINE", rightX, y);

      y += 26;
      const donationDate = donation.createdAt
        ? new Date(donation.createdAt).toLocaleDateString("en-GB")
        : "-";
      doc.font("Times-Roman").text("Date:", leftX, y);
      doc.font("Times-Bold").text(donationDate, rightX, y);


      if (fs.existsSync("logo/STAMP.png")) {
        doc.save();
        doc.opacity(0.70);
        doc.image("logo/STAMP.png", 40, y - 50, { width: 160 });
        doc.restore();
      }

       const sigY = doc.y;
         
    doc
      .fontSize(7)
      .font("Times-Bold")
      .text("NIHAL KUMAR GUPTA", 440, 350,{underline: true,});
    
 
    doc
      .fontSize(15)
      .font("Times-Bold")
      .text("Authorized Signatory", 420, 360);
    
  
    
    if (fs.existsSync("logo/sighnature.png")) {
      doc.save();
    
    
      doc.rotate(290, { origin: [400, 298] });
    
      
      doc.image("logo/sighnature.png", 375, 360, { width: 70 });
    
      doc.restore(); 
    }


const boxX = 50;
const boxY = doc.page.height - 350; 
const boxWidth = doc.page.width - 100;
const boxHeight = 70;


doc
  .lineWidth(1)
  .rect(boxX, boxY, boxWidth, boxHeight)
  .stroke();


doc
  .font("Times-Roman")
  .fontSize(10)
  .fillColor("black")
  .text(
    "Sankalp Setu Foundation is provisionally approved under Section 80G of the Income Tax Act, 1961 vide sub-clause (A) of clause (iv) of the first proviso to sub-section (5) of Section 80G, dated 03-12-2025, valid from Assessment Year 2026-27 to 2028-29.",
    boxX + 10,
    boxY + 18,
    {
      width: boxWidth - 20,
      align: "center",
    }
  )
  .fillColor("black");


      
      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};
