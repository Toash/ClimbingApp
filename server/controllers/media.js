import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";

/**
 * Get presigned put url for media s3 bucket
 * @param {String} s3key
 * @returns
 */
export const getPresignedPutUrl = async (req, res) => {
  console.log("Received request to generate presigned URL");
  const s3key = req.query.s3key;

  if (!s3key) {
    return res.status(400).json({ error: "Missing s3key in query params" });
  }

  const client = new S3Client({
    region: process.env.AWS_REGION,
  });

  let version = 0;
  let exists = true;
  let s3keyToUse = s3key;

  //append version at end of file name not extension
  const dotIndex = s3key.lastIndexOf(".");
  const fileName = s3key.substring(0, dotIndex);
  const fileExtension = s3key.substring(dotIndex);

  /* 
  handle duplicate files, we dont want multiple sources pointing to the same file because
   if a source is deleted then so will the file, then the other sources will not be pointing to a file. 
   */
  while (exists) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.MEDIA_BUCKET,
        Key: s3keyToUse,
      });
      await client.send(headCommand);

      // file exists
      version++;
      s3keyToUse = `${fileName}_${version}${fileExtension}`;
    } catch (error) {
      if (error instanceof NotFound) {
        exists = false;
      } else {
        console.error(error);
        return res.status(500).json({ error: "Error checking file existence" });
      }
    }
  }

  console.log("S3 key that will be used for the presigned url: ", s3keyToUse);

  const command = new PutObjectCommand({
    Bucket: process.env.MEDIA_BUCKET,
    Key: s3keyToUse,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  if (typeof presignedUrl === "undefined") {
    console.error("Presigned URL is undefined");
    return res.status(500).json({
      error: "Could not generate presigned URL for file " + s3keyToUse,
    });
  }
  res.status(200).json({ fullUrl: s3keyToUse, presignedUrl });
};


/**
 * Compress media using aws convert.
 *   const { rawUrl, compressedUrl } = req.body;
 * @param {*} req 
 * @param {*} res 
 */
export const compressMedia = async (req, res) => {

  const { rawUrl, compressedUrl } = req.body;

  const mediaConvertClient = new MediaConvertClient({
    endpoint: "https://wa11sy9gb.mediaconvert-fips.us-east-2.amazonaws.com",
    region: "us-east-2",
  })

  const params = {
    Role: 'arn:aws:iam::443370702352:role/service-role/MediaConvert_Default_Role',
    Settings: {
      Inputs: [
        {
          FileInput: rawUrl,
        },
      ],
      OutputGroups: [
        {
          Name: 'File Group',
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: compressedUrl,
            },
          },
          Outputs: [
            {
              ContainerSettings: {
                Container: 'MP4',
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR', // Set the rate control mode
                    MaxBitrate: 5000000, // Specify max bitrate for QVBR
                    QvbrQualityLevel: 7, // Optional: Adjust quality level (1-10, higher is better)
                  },
                },
              },
            },
          ],
        },
      ],
    },
  };


  try {
    const job = await mediaConvertClient.send(new CreateJobCommand(params))
    console.log("MediaConvert job created successfully:", job);
    if (job.Job.Status == "COMPLETE") {
      res.status(200)
    } else {
      res.status(500)
    }

  } catch (e) {
    console.log("Error creating MediaConvert job: ", e);
    res.status(500)
    throw new Error("MediaConvert job creation failed.");
  }
}