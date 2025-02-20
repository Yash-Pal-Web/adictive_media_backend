require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
  
  const createAccountRoutes = require("./routes/createAccount");
  const mediaRoutes = require("./routes/mediaRoutes");
  const videoRoutes = require("./routes/videoRoutes");
  



const app = express();

//connect to our database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongodb connected successfully"))
  .catch((e) => console.log(e));

//use middlewares
app.use(express.json());

  app.use("/create", createAccountRoutes);
  app.use("/media", mediaRoutes);
  app.use("/api/videos", videoRoutes);
  
  

app.listen(process.env.PORT, () => {
  console.log(`Server is now running on port ${process.env.PORT}`);
});
