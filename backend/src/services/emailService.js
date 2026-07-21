import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"TMDB" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your TMDB account",

    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>TMDB Verification</h2>

        <p>Your OTP is</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });
};