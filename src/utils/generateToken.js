const jwt = require("jsonwebtoken");

const generateTokens = async (account) => {
  

  
  if (!account._id) {
    throw new Error("Missing accountId in account object");
  }

  
  const accessToken = jwt.sign(
    {
      accountId: account._id.toString(), 
      firstName: account.firstName,
      email: account.email
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "60m" }
  );

  return { accessToken };
};

module.exports = generateTokens;
