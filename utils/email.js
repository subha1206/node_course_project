const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // NOTE create a transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // NOTE define email option

  const mailOption = {
    from: 'Subha Sarkar <hello@email.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // NOTE send the email

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
