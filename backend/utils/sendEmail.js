const transporter = require('../config/nodemailer');

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"SpotIQ" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
