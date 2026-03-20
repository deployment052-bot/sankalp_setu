const fs = require("fs");
const puppeteer = require("puppeteer");

module.exports = async (donation) => {
  const receiptNo = "REC-" + Date.now();
  const html = fs.readFileSync("templates/receipt.html", "utf8")
    .replace("{{name}}", donation.name)
    .replace("{{amount}}", donation.amount)
    .replace("{{payment_id}}", donation.payment_id)
    .replace("{{receipt_no}}", receiptNo)
    .replace("{{date}}", new Date().toDateString());

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: `receipts/${receiptNo}.pdf` });
  await browser.close();

  donation.receipt_number = receiptNo;
  donation.receipt_url = `receipts/${receiptNo}.pdf`;
  await donation.save();
};
