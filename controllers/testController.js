const { uploadToB2 } = require("../utils/files/uploadController")
const asyncHandler = require('express-async-handler');
const { deleteFile: deleteB2File } = require("../utils/files/deleteBucketFile");
const fileTypes = require("../config/fileType");
const imageSchema = require("../model/Image");

const uploadFile = asyncHandler(async (req, res, next) => {
    const { buffer, mimetype, originalname } = req.file;
    const userId = req.user._id;

    if (!buffer || !mimetype || !originalname) {
        res.status(400).json({ message: "File not found" });
        return;
    }

    const validMineTypes = fileTypes['image'];

    if (!validMineTypes.includes(mimetype)) {
        res.status(400).json({ message: "Invalid file type" });
        return;
    }

    try {
        const fileInfo = await uploadToB2(buffer, mimetype, originalname);

        // use this fileInfo to save to database
        const profileImage = await imageSchema.create({
            fileName: fileInfo.fileName,
            fileID: fileInfo.id,
            uploadDate: fileInfo.time,
            mineType: mimetype
        });

        // link the image document to user document

        res.json(fileInfo);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

const deleteFile = asyncHandler(async (req, res, next) => {
    const { fileId, fileName } = req.body;
    if (!fileId || !fileName) {
        res.status(400).json({ message: "Missing fileId or fileName" });
    }
    try {
        const fileInfo = await deleteB2File(fileId, fileName);
        console.log(fileInfo);
        res.json(fileInfo.data);
    } catch (err) {
        console.log(err);
        if (error instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Something went wrong" });
        }

    }
}
);


module.exports = { uploadFile, deleteFile }