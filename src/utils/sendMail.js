const nodemailer = require("nodemailer");

const sendMail = async ({ firstName, lastName, email, password }) => {

  try {
    
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
      user: 'prince4@ethereal.email',
        pass: 'ZceVn916EHyckpGMaQ'
      },
    });

    let info = await transporter.sendMail({
      from: '"Maddison Foo Koch " <prince4@ethereal.email>', // sender address
      to: email, // recipient's email
      subject: "Thank you for creating your account",
      text: `Hello ${firstName}, your account has been created successfully.`,
      html: `<b>First Name: ${firstName}<br>Last Name: ${lastName}<br>Email: ${email}<br>Password: ${password}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendMail;
