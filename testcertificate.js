const generateCertificate = require("./utils/donation/generateCertificate");

const fakeDonation = {
  _id: "test123",
  name: "Test User",
  amount: 500,
  createdAt: new Date()
};

(async () => {
  const path = await generateCertificate(fakeDonation);
  console.log("Certificate generated at:", path);
})();
