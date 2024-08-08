import nodemailer from "nodemailer";
import { google } from "googleapis";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRETE;
  const redirectUrl = process.env.REDIRECT_URL;

  const refreshToken = process.env.REFRESH_TOKEN;

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  );

  try {
    console.log(email, verifyCode);

    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const accessToke = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "abdullah457tu@gmail.com",
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToke,
      },
    });

    const mailOptions = {
      from: "trueFeedBacks <abdullah457tu@gmail.com>",
      to: email,
      subject: "Verification code from true feedbacks",
      text: "here is your verification code",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #333333;
            margin: 0;
        }
        .content {
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
            padding: 20px;
        }
        .content p {
            margin: 0 0 20px;
        }
        .verify-code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888888;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Hello ${username},</p>
            <p>Thank you for signing up on our platform!</p>
            <p>To complete your registration, please verify your email address by entering the following code:</p>
            <div class="verify-code">${verifyCode}</div>
            <p>If you did not sign up for an account, you can ignore this email.</p>
            <p>Best regards,<br>The trueFeedBacks Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 trueFeedBacks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
    };

    const res = await transport.sendMail(mailOptions);

    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to send verification email." };
  }
}
