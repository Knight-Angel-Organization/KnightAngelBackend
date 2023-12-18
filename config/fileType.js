/**
 *  This file contains the file types that are allowed to be uploaded to the server.
*/
const fileTypes = {
    "image": ["image/jpeg", "image/png", "image/gif"],
    "video": ["video/mp4", "video/ogg", "video/webm"],
    "audio": ["audio/mpeg", "audio/ogg", "audio/wav"],
    "document": ["application/pdf", "application/msword", "text/plain"]
}

module.exports = fileTypes;