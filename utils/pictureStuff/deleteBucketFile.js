const { connect } = require('./uploadController');

/**
 * Deletes a file from a bucket
 * @param {string} id - The file's ID.
 * @param {string} fileName - The file's name.
 * @returns {Promise<void>}
 */
function deleteFile(id, fileName) {
    return new Promise(async (resolve, reject) => {
        try {
            const b2 = await connect();
            const res = await b2.deleteFileVersion({
                fileId: id,
                fileName: fileName
            });
            resolve(res);
        } catch (err) {
            reject(err);
        }
    });
}


module.exports = { deleteFile }