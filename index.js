const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const app = express();
dotenv.config();

const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(globalCorsOptions));
app.options("*", cors(globalCorsOptions));
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(data) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `SENDER_NAME <${
        process.env.EMAIL_USER || "kawsaralhasan.360@gmail.com"
      }>`,
      to: data?.email,
      subject: data?.subject,
      text: data?.text,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

app.post("/send-email", async (req, res) => {
  const { email, subject, text } = req.body;
  const body = req.body;
  res.send(body);
  // if (!email) {
  //   return res.status(400).send("Email is required");
  // }
  // if (!subject) {
  //   return res.status(400).send("subject is required");
  // }
  // if (!text) {
  //   return res.status(400).send("text is required");
  // }

  // const data = { email, subject, text };

  // try {
  //   const result = await sendMail(data);
  //   res.send("Email sent successfully");
  // } catch (error) {
  //   res.status(500).send("Error sending email");
  // }
});

const port = process.env.PORT || 5100;

app.listen(port, () => {
  console.log(`Email Sender Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Email Sender is working");
});
