const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');

const sendEmail = async options => {
  // create reusable transporter object using the default SMTP transport
  console.log('options', options);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // requireTLS: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
  });
  console.log('options after transport method', options);
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  console.log('message >>>', mailOptions)
  // const info = await transporter.sendMail(message);
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });

  // console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

module.exports = sendEmail;
