const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");
//const sharp = require("sharp");


const uploadMedia = async (req, res) => {
  try {
   /*  const { width, height } = await sharp(req.file.buffer).metadata();

    if (width !== 5 || height !== 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid image dimensions. Only 5x5 pixels allowed.",
      });
    }
 */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file found. Please add a file and try again!",
      });
    }

    const { originalname, mimetype } = req.file;
    const accountIdString = req.user.accountId; 
    const bio = req.body.bio || "";

  
    if (!mongoose.Types.ObjectId.isValid(accountIdString)) {
      
      return res.status(400).json({
        success: false,
        message: "Invalid accountId format",
      });
    }

    
    
    const accountId = mongoose.Types.ObjectId.createFromHexString(accountIdString);

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      accountId,
      bio,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload is successful",
    });
  } catch (error) {
    console.error("Error creating media:", error);
    res.status(500).json({
      success: false,
      message: "Error creating media",
    });
  }
};



 /* const getAllMedias = async (req, res) => {
  try {
    const results = await Media.find({});
    res.json({ results });
  } catch (e) {
    console.log("Error fetching medias", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medias",
    });
  }
}; 
  */

const getAllMedias = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 media per page
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $lookup: {
          from: "accounts", // Assuming accounts collection contains user details
          localField: "accountId",
          foreignField: "_id",
          as: "accountDetails"
        }
      },
      {
        $unwind: { path: "$accountDetails", preserveNullAndEmptyArrays: true } // Keep records even if no account is found
      },
      {
        $project: {
          mediaId: "$_id",
          title: 1,
          description: 1,
          fileUrl: "$url",
          createdAt: 1,
          accountId: "$accountDetails._id",
          firstName: "$accountDetails.firstName",
          lastName: "$accountDetails.lastName"
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }], // Get total number of media items
          data: [{ $skip: skip }, { $limit: limit }] // Apply pagination
        }
      },
      {
        $project: {
          totalMedia: { $arrayElemAt: ["$totalCount.count", 0] },
          medias: "$data"
        }
      }
    ];

    const results = await Media.aggregate(aggregationPipeline);
    const response = results[0] || { totalMedia: 0, medias: [] };

    res.json({
      success: true,
      totalMedia: response.totalMedia || 0,
      medias: response.medias
    });
  } catch (error) {
    console.error("Error fetching medias", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medias"
    });
  }
};




/* const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.json({ success: true, media });
  } catch (error) {
    console.error("Error fetching media by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching media",
    });
  }
}; */

const getMediaById = async (req, res) => {
  try {
    const { accountId } = req.params; // Extract accountId from request params
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 5 media per page
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $match: { accountId: accountId } // Filter by accountId
      },
      {
        $lookup: {
          from: "accounts", // Assuming the account collection is named "accounts"
          localField: "accountId",
          foreignField: "_id",
          as: "accountDetails"
        }
      },
      {
        $unwind: { path: "$accountDetails", preserveNullAndEmptyArrays: true } // Ensure even if user details are missing, data is returned
      },
      {
        $project: {
          mediaId: "$_id",
          title: 1,
          description: 1,
          fileUrl: "$url",
          createdAt: 1,
          accountId: "$accountDetails._id",
          firstName: "$accountDetails.firstName",
          lastName: "$accountDetails.lastName"
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }], // Get total number of media for the account
          data: [{ $skip: skip }, { $limit: limit }] // Apply pagination
        }
      },
      {
        $project: {
          totalMedia: { $arrayElemAt: ["$totalCount.count", 0] },
          medias: "$data"
        }
      }
    ];

    const results = await Media.aggregate(aggregationPipeline);
    const response = results[0] || { totalMedia: 0, medias: [] };

    res.json({
      success: true,
      totalMedia: response.totalMedia || 0,
      medias: response.medias
    });
  } catch (error) {
    console.error("Error fetching media by accountId:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching media"
    });
  }
};



module.exports = { uploadMedia, getAllMedias,getMediaById };
