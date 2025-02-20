const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  password: { type: String },
});

module.exports = mongoose.model("Account", AccountSchema);

/* listVideo = [
  [
    {
      userId: 1,
      fN: "Suneel",
      ln: "yadav",
      videoList: [{ id: 1, title: "", decs: "", fileName: "link" }],
    },
  ],
  [
    {
      userId: 2,
      fN: "YAsh",
      ln: "Pal",
      videoList: [
        { id: 1, title: "", decs: "", fileName: "link" },
        { id: 2, title: "", decs: "", fileName: "link" },
        { id: 3, title: "", decs: "", fileName: "link" },
        { id: 4, title: "", decs: "", fileName: "link" },
        { id: 5, title: "", decs: "", fileName: "link" },
      ],
    },
  ],
  [
    {
      userId: 3,
      fN: "Santosh",
      ln: "yadav",
      videoList: [{ id: 1, title: "", decs: "", fileName: "link" }],
    },
  ],
]; */
