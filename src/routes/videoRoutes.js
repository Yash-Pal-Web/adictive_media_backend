const express = require("express");
const multer = require("multer");
const { uploadVideo, getAllVideos, getVideosByAccountId } = require("../controllers/videoController");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

// Configure multer for video uploads (MP4 only, max 6MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024, // 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only MP4 videos are allowed!"), false);
    }
  },
}).single("video");

router.post(
  "/upload",
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "Multer error while uploading video!",
          error: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video found!",
        });
      }

      next();
    });
  },
  uploadVideo
);

router.get("/get", authenticateRequest, getAllVideos);
router.get("/get/:accountId" , getVideosByAccountId);

module.exports = router;
