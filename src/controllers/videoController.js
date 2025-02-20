const Video = require("../models/Video");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");

const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required!",
      });
    }

    if (title.split(" ").length > 30) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 30 words!",
      });
    }

    if (description.split(" ").length > 120) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 120 words!",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video found. Please add a video and try again!",
      });
    }

    const { originalname, mimetype } = req.file;
    const accountIdString = req.user.accountId;

    if (!mongoose.Types.ObjectId.isValid(accountIdString)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accountId format",
      });
    }

    if (mimetype !== "video/mp4") {
      return res.status(400).json({
        success: false,
        message: "Only MP4 video files are allowed!",
      });
    }

    // const accountId = new mongoose.Types.ObjectId(accountIdString);

    const accountId =
      mongoose.Types.ObjectId.createFromHexString(accountIdString);
    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);

    const newlyCreatedVideo = new Video({
      title,
      description,
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      accountId,
    });

    await newlyCreatedVideo.save();

    res.status(201).json({
      success: true,
      videoId: newlyCreatedVideo._id,
      url: newlyCreatedVideo.url,
      message: "Video upload is successful",
    });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({
      success: false,
      message: "Error creating video",
    });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 5 videos per page
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $sort: { createdAt: -1 } // Sort videos by newest first
      },
      {
        $group: {
          _id: "$accountId", // Group by accountId (user)
          videos: {
            $push: {
              id: "$_id",
              title: "$title",
              desc: "$description",
              fileName: "$url"
            }
          }
        }
      },
      {
        $lookup: {
          from: "accounts", 
          localField: "_id",
          foreignField: "_id",
          as: "accountDetails"
        }
      },
      {
        $unwind: "$accountDetails"
      },
      {
        $project: {
          accountId: "$_id",
          fN: "$accountDetails.firstName", // Fetch first name from "accounts"
          ln: "$accountDetails.lastName", // Fetch last name from "accounts"
          videoList: "$videos"
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }], // Get the total count of accounts with videos
          data: [{ $skip: skip }, { $limit: limit }]
        }
      },
      {
        $project: {
          totalUsers: { $arrayElemAt: ["$totalCount.count", 0] },
          users: "$data"
        }
      }
    ];

    const results = await Video.aggregate(aggregationPipeline);
    const response = results[0] || { totalUsers: 0, users: [] };

    res.json({
      success: true,
      totalUsers: response.totalUsers || 0,
      users: response.users
    });
  } catch (error) {
    console.error("Error fetching videos", error);
    res.status(500).json({
      success: false,
      message: "Error fetching videos"
    });
  }
};







const  getVideosByAccountId = async (req, res) => {
  try {
    const { accountId } = req.query.accountId; // Get accountId from query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 5; // Limit videos to 5 per response
    const skip = (page - 1) * limit;

    if (!accountId) {
      return res.status(400).json({ success: false, message: "Account ID is required" });
    }

    // Ensure accountId is a valid ObjectId if stored as an ObjectId
    const matchCondition = mongoose.Types.ObjectId.isValid(accountId)
      ? { accountId: new mongoose.Types.ObjectId(accountId) }
      : { accountId };

    // Find the user and get only 5 videos from their videoList
    const user = await User.findOne(matchCondition, {
      _id: 1,
      accountId: 1,
      fN: 1,
      ln: 1,
      videoList: { $slice: [skip, limit] }, // Get only 5 videos based on pagination
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        accountId: user.accountId,
        fN: user.fN,
        ln: user.ln,
        videoList: user.videoList, // Only 5 videos will be returned
      },
    });
  } catch (error) {
    console.error("Error fetching user videos by accountId:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching videos",
    });
  }
};
module.exports = { uploadVideo, getAllVideos, getVideosByAccountId };
