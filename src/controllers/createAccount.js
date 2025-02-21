const Account = require("../models/createAccount");
const generateRandomPassword = require("../utils/generatePassword");
const generateTokens = require("../utils/generateToken"); 
const sendMail = require("../utils/sendMail");

 const createAccount = async (req, res) => {
  
  try {
    const { firstName, lastName, email, number } = req.body;

    // Check if the user already exists
    let account = await Account.findOne({ $or: [{ email }, { firstName }] });

    if (account) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate a random password
    const password = generateRandomPassword(firstName, lastName, number);

    // Create new account with the generated password
    account = new Account({ firstName, lastName, email, number, password });
    

    await sendMail({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      password: account.password
    });


    await account.save();
 
    res.status(201).json({
      success: true,
      data: { firstName, lastName, email, number, password },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
}; 

/* const createAccount = async(req,res)=>{
  try {
    const { firstName, lastName, email, password } = req.body;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save the user
    await newUser.save();

    // Call sendMail function
    await sendMail({
      body: {
        firstName,
        lastName,
        email,
        password, // You can send the original password or a temporary one
      },
    });

    res.status(201).json({ success: true, message: "Account created successfully!" });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ success: false, message: "Error creating account" });
  }
}
 */

/*            Login Api                        */
const login = async (req, res) => {
  try {
    const { firstName, password } = req.body;

    if (!firstName || !password) {
      return res.status(400).json({
        success: false,
        message: "First name and password are required",
      });
    }

    // Find user by firstName
    const account = await Account.findOne({ firstName });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check password
    if (account.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate Tokens
    const { accessToken } = await generateTokens(account); 

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      
       accountId: account._id, 
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};


module.exports = { createAccount, login };
