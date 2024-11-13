import {
  DeleteObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MediaConvertClient, CreateJobCommand, GetJobCommand, JobStatus, InputRotate, ScalingBehavior, PadVideo, AudioDefaultSelection } from "@aws-sdk/client-mediaconvert";

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
 * Compress media using aws mediaconvert.
 * 
 *   const { deleteRaw } = req.params;
 * 
 *   const { rawUrl, compressedUrl } = req.body;
 * @param {*} req 
 * @param {*} res 
 */
export const compressMedia = async (req, res) => {

  const { deleteRaw } = req.query;
  const { rawUrl, compressedUrl } = req.body;

  if (!rawUrl || !compressedUrl) {
    throw new Error("Must specify raw url and compressed url when compressing media")
  }

  const extension = rawUrl.split(".").pop();
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
          VideoSelector: {
            Rotate: InputRotate.AUTO, // get from metadata
            PadVideo: PadVideo.BLACK
          },
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: AudioDefaultSelection.DEFAULT
            }
          }
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
                Container: extension.toUpperCase() // same extension as input.
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR', // bit rate will change depending on how complex the video is
                    MaxBitrate: 3500000, // bit rate cap
                    QvbrQualityLevel: 7, // quality (1-10), higher is better
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 128000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };


  try {
    const job = await mediaConvertClient.send(new CreateJobCommand(params))
    console.log("MediaConvert job created successfully:", job);

    const jobId = job.Job.Id;
    console.log("Analyzing the status for mediaconvert job id:", jobId)

    // repeatedly check the status of the job to return respond accordingly.
    let jobStatus = "";
    let jobDetails;
    while (jobStatus !== JobStatus.COMPLETE && jobStatus !== JobStatus.ERROR) {
      jobDetails = await mediaConvertClient.send(new GetJobCommand({ Id: jobId }))
      jobStatus = jobDetails.Job.Status;

      if (jobStatus === JobStatus.COMPLETE) {
        console.log("JobStatus.COMPLETE: MediaConvert job completed successfully");

        // delete old raw media
        if (deleteRaw === "true") {
          console.log("Deleting raw media file.")
          const s3Client = new S3Client({
            region: process.env.AWS_REGION,
          });
          // Extract bucket name and key from rawUrl
          // "s3://toash-climbing-media/dir/somefile" becomes "[toash-climbing-media, dir, somefile]"
          const rawUrlParts = rawUrl.replace('s3://', '').split('/');
          // gets "toash-climbing-media". "[dir, somefile]"
          const Bucket = rawUrlParts.shift(); //pop from front
          // gets "dir/somefile"
          const Key = rawUrlParts.join('/');

          // Delete the raw media file from S3
          await s3Client.send(new DeleteObjectCommand({ Bucket, Key }))
          console.log("Raw media file deleted successfully from the following bucket and key:", { Bucket, Key });
        }

        if (deleteRaw === "true") {
          return res.status(200).json({ message: "MediaConvert job completed successfully, deleted raw file." });
        } else {
          return res.status(200).json({ message: "MediaConvert job completed successfully" });
        }

      }

      if (jobStatus === JobStatus.ERROR) {
        console.error("JobStatus.ERROR: MediaConvert job failed");
        return res.status(500).json({ message: "MediaConvert job failed" });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (e) {
    console.log("Error creating MediaConvert job: ", e);
    return res.status(500).json({ message: "MediaConvert job failed" });
  }


}