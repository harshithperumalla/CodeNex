const cloudinary = require("cloudinary").v2;

// Configure Cloudinary if env variables are available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
}

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { file } = req;
    const isVideo = file.mimetype.startsWith("video/");
    const isPdf = file.mimetype === "application/pdf";
    const resourceType = isVideo ? "video" : isPdf ? "raw" : "auto";

    const isCloudinaryConfigured =
      !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) ||
      !!process.env.CLOUDINARY_URL;

    if (isCloudinaryConfigured) {
      // Stream upload to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "codenex_courses",
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      const result = await uploadPromise;
      return res.json({
        success: true,
        url: result.secure_url || result.url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        originalName: file.originalname,
      });
    } else {
      // Fallback response if Cloudinary keys not configured in local .env
      const base64Data = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      return res.json({
        success: true,
        url: base64Data,
        publicId: `local_${Date.now()}`,
        resourceType: resourceType,
        originalName: file.originalname,
        note: "Cloudinary credentials missing in backend .env; served as data URL",
      });
    }
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message || "File upload failed" });
  }
};
