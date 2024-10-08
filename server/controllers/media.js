import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Get presigned put url for media s3 bucket
 * @param {String} s3key
 * @returns
 */
export const getPresignedPutUrl = async (req, res) => {
  console.log("Received request to generate presigned URL");
  const s3key = req.query.s3key;

  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };

  // since this will be on a lambda i think aws will automaticlaly pass credentials
  const client = new S3Client({
    region: "us-east-2",
  });
  const command = new PutObjectCommand({
    Bucket: "toash-climbing-media",
    Key: s3key,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  res.status(200).json({ presignedUrl });
};
