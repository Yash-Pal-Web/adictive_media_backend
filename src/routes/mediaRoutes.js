const express = require("express");
const multer = require("multer");

const {
  uploadMedia,
  getAllMedias,
  getMediaById,
} = require("../controllers/mediaController");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

//configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
}).single("file");
//console.log("upload=============>..", upload);

router.post(
  "/upload",
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        
        return res.status(400).json({
          message: "Multer error while uploading:",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        
        return res.status(500).json({
          message: "Unknown error occured while uploading:",
          error: err.message,
          stack: err.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file found!",
        });
      }

      next();
    });
  },
  uploadMedia
);

router.get("/get", authenticateRequest, getAllMedias);
router.get("/get/:id", authenticateRequest, getMediaById);


module.exports = router;
