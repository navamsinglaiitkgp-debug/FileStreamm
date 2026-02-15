const {Upload} = require('@aws-sdk/lib-storage');
const createS3Client = require('../config/s3Client');
const  {GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command} = require('@aws-sdk/client-s3');
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');

class StorageService {
    constructor() {
        this.s3 = createS3Client(process.env.S3_ENDPOINT);
        this.s3Public = createS3Client(process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT);
        this.bucket = process.env.S3_BUCKET;
    }
    async uploadBuffer({buffer, key, contentType}) {
        if (!key) throw new Error("uploadBuffer: key required");
        if (!buffer) throw new Error("uploadBuffer: buffer required");
        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType || 'application/octet-stream',
            },
        });
        await upload.done();
        return {bucket : this.bucket, key};
    }
    async uploadStream({stream, key, contentType}) {
        if (!key) throw new Error("uploadStream: key required");
        if (!stream) throw new Error("uploadStream: stream required");

        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream,
                ContentType: contentType || 'application/octet-stream',
            },
        });
        await upload.done();
        return {bucket : this.bucket, key};
    }

    async deleteObject({key}) {
        if (!key) throw new Error("deleteObject: key required");
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.s3.send(command);
    }

    async getPresignedUrl({key, expiresInSeconds}) {
        if (!key) throw new Error("getSignedUrl: key required");
        const expiresIn = Number(expiresInSeconds) || process.env.DOWNLOAD_URL_EXPIRES_SECONDS || 60;

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const url = await getSignedUrl(this.s3Public, command, {expiresIn});
        return url;
    }

    async getObjectStream({key}) {
        if (!key) throw new Error("getObjectStream: key required");
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = await this.s3.send(command);
        return response.Body;
    }

    async deletePrefix({prefix}) {
        let continuationToken = undefined;
        while (true) {
            const listCommand = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken
            });
            const listResponse = await this.s3.send(listCommand);
            const contents = listResponse.Contents || [];
            for (const item of contents) {
                await this.deleteObject({key: item.Key});
            }
            if (!listResponse.IsTruncated) {
                break;
            }
            continuationToken = listResponse.NextContinuationToken;
        }
    }

    async getPresignedUploadUrl({key, contentType, expiresInSeconds}) {
        if (!key) throw new Error("getPresignedUploadUrl: key required");
        const expiresIn = Number(expiresInSeconds) || process.env.UPLOAD_URL_EXPIRES_SECONDS || 300;
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType || 'application/octet-stream',
        });
        const url = await getSignedUrl(this.s3Public, command, {expiresIn});
        return {url, expiresInSeconds: expiresIn};
    }

}

module.exports = new StorageService();
