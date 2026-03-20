const fs = require("fs");
const puppeteer = require("puppeteer");

async function generateReceipt(donation) {
 
  let html = fs.readFileSync("templates/receipt.html", "utf8");


  html = html
    .replace("{{receipt_no}}", donation.receipt_number || "N/A")
    .replace("{{date}}", new Date().toLocaleDateString())
    .replace("{{name}}", donation.name || "")
    .replace("{{amount}}", donation.amount || 0)
    .replace("{{payment_id}}", donation.payment_id || "N/A")
    .replace("{{phone}}", donation.phone || "")
    .replace("{{address}}", donation.address || "")
    .replace("{{notes}}", donation.notes || "");


  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: `receipts/${donation.receipt_number}.pdf` });
  await browser.close();
}
