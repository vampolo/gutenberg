const Storage = require('@google-cloud/storage');

const PROJECTID = '930718111829';

const storage = new Storage({
  projectId: PROJECTID,
});

const bucketName = 'gutenberg-amazon-reviews';

const uploadFile = async (filename) => {
  return await storage
    .bucket(bucketName)
    .upload(filename);
};

module.exports = {
  uploadFile
};
