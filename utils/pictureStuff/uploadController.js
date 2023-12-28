const B2 = require('backblaze-b2');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { logEvents } = require('../../middleware/logEvents');

/**
 * Connect to Backblaze B2
 * @returns {Promise<B2>}
 */
const connect = async () => {
    const b2 = new B2({
        applicationKeyId: process.env.BACKBLAZE_API_KEY_ID,
        applicationKey: process.env.BACKBLAZE_API_KEY,
        retry: {
            retries: 3
        }
    });

    await b2.authorize();
    return b2;
}

/**
 * Uploads a file to Backblaze B2.
 * This function uploads any file to Backblaze B2,
 * ensuring the file type/extension is checked before
 * calling.
 * If successful, it returns a unique file name.
 * The complete URL to the file is constructed
 * independently from its base URL.
 *
 * @param {Buffer} fileData - The file data to be uploaded.
 * @param {string} mimetype - The file's mimetype.
 * @param {string} filename - The file's original name.
 * @returns {Promise<{fileName: string, url: string, id: string, time: number}>}
 */
const uploadToB2 = async (fileData, mimetype, filename) => {
    // Connect to Backblaze B2
    const b2 = await connect();

    // Generate a unique file name, using the original name or a timestamp if unavailable
    const fileName = generateFileName(filename ?? Date.now().toString());

    // Get the upload URL for the specified bucket
    const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
    });

    // Extract the authorization token and upload URL from the response
    const { authorizationToken, uploadUrl } = uploadUrlResponse.data;

    // Upload the file to Backblaze B2 using the obtained information
    const uploadedFile = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName,
        data: fileData,
        mime: mimetype
    });
    logEvents(`${fileName}|${mimetype} id is = ${uploadedFile.data.fileId}.`, 'fileUploadLog.txt');
    return {
        fileName: fileName,
        id: uploadedFile.data.fileId,
        mimetype,
        time: uploadedFile.data.uploadTimestamp
    };
}

/**
 * Generates a unique file name.
 * This function generates a unique file name
 * using the original name and a timestamp.
 * If a user is logged in, their email is also
 * used to generate the file name.
 * @param {string} originalName - The original name of the file.
 * @param {string} userEmail - The user's email.
 * @returns {string}
 */
const generateFileName = (originalName, userEmail = "") => {
    const ext = path.extname(originalName);
    if (userEmail) {
        return crypto.createHash('sha1').update(Date.now() + '_' + Math.floor(Math.random() * 11000) + '_' + userEmail).digest('hex') + ext;
    } else {
        return crypto.createHash('sha1').update(Date.now() + '_' + Math.floor(Math.random() * 11000)).digest('hex') + ext;
    }
}

// Multer storage
const storage = multer.memoryStorage()

// Multer upload
const upload = (field) => multer({ storage: storage }).single(field);

module.exports = {
    connect,
    uploadToB2,
    generateFileName,
    upload
}

