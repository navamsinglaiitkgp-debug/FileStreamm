const {S3Client} = require('@aws-sdk/client-s3');

function createS3Client(endpointOverride) {
    const s3 = new S3Client({
        endpoint: endpointOverride || process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED"
    });
    return s3;
}

module.exports = createS3Client;