const { google } = require("googleapis");
const express = require("express");
const app = express();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/oauth2callback";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);


app.get("/auth", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/drive.file"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", 
    scope: scopes,
  });
  res.redirect(url);
});


app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
 
  req.session.tokens = tokens; 

  res.send("Authentication successful! You can now upload files.");
});
