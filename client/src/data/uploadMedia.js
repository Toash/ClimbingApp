/* 
Uploads media into raw and compressed format. Videos are compressed.
s3 key is the key that refers to the media. For example "a.mp4"

media is the actual media to upload

compress will compress the media (only mp4 and mov supported)
*/
export const uploadMedia = async ({ s3key, media, compress = false }) => {

  const videoExtensions = [".mp4", ".mov"]

  // get presigned url for the specific s3key
  // example s3key: 016bf520-c011-70ee-c024-6761acd7bf31/ForBiggerJoyrides.mp4
  let data;
  let presignedUrl;
  let s3KeyVersioned; // handles duplicate media. for example abc.mp4, abc_1.mp4
  try {
    const response = await fetch(
      import.meta.env.VITE_APP_API_BASE_URL +
      "/media/presigned-upload?" +
      new URLSearchParams({ s3key }).toString(),
      {
        method: "GET",
      }
    );
    data = await response.json();
  } catch (e) {
    console.log("Error trying to get presigned url: ", e);
    throw e;
  }

  /* 
  presignedUrl example: "https://toash-climbing-media.s3.us-east-2.amazonaws.com/
  raw/016bf520-c011-70ee-c024-6761acd7bf31
  /file_example_MOV_480_700kB.mov?
  etc..............
  */
  presignedUrl = data.presignedUrl;

  /* 
  fullUrl example: "raw/016bf520-c011-70ee-c024-6761acd7bf31/file_example_MOV_480_700kB.mov"
  (Not a full url, just contains the key for the media source.)
  */
  s3KeyVersioned = data.fullUrl;

  // console.log("Json object retrieved: ", data);
  // console.log("Presigned URL retrieved: ", presignedUrl);
  // console.log("Full raw url: ", rawS3KeyWithVersion)

  if (!data || !presignedUrl) {
    throw new Error("Did not get presigned url");
  }

  // upload file to s3
  try {
    console.log("Uploading file to S3 bucket with path: ", s3KeyVersioned);
    const s3Response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": media.type,
      },
      body: media,
    });

    if (!s3Response.ok) {
      throw new Error("Failed to upload media to S3");
    }
  } catch (e) {
    console.log("Error uploading media: ", e)
    throw e;
  }

  // compress if we have a video
  let compressedWebUrl; // the web url that accesses the compressed media.
  let compressedVideo = false;
  const extension = s3key.slice(s3key.lastIndexOf(".")).toLowerCase().trim();
  if (videoExtensions.includes(extension) && compress) {
    await compressVideo();
  }


  console.log("Media successfully uploaded to S3");

  const rawWebUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + s3KeyVersioned;
  if (compressedVideo) {
    return { url: compressedWebUrl, message: "media compressed and uploaded." }; // videos should always be compressed
  } else {
    return { url: rawWebUrl, message: "media uploaded." } // images are not compressed.
  }


  async function compressVideo() {
    compressedVideo = true;
    console.log("Compressing video...");

    // source: 016bf520-c011-70ee-c024-6761acd7bf31/file_example_MOV_480_700kB.mov

    // example: [ 016bf520-c011-70ee-c024-6761acd7bf31, file_example_MOV_480_700kB.mov ]
    let paths = s3KeyVersioned.split("/");
    // file_example_MOV_480_700kB.mov
    let fileName = paths.pop()
    fileName = "COMPRESSED_" + fileName;
    // example: [ 016bf520-c011-70ee-c024-6761acd7bf31, COMPRESSED_file_example_MOV_480_700kB.mov ]
    paths.push(fileName)

    // example:  "016bf520-c011-70ee-c024-6761acd7bf31/COMPRESSED_file_example_MOV_480_700kB.mov"
    const compressedS3KeyVersioned = paths.join("/")

    compressedWebUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + compressedS3KeyVersioned;
    //compressedWebUrl = compressedWebUrl.slice(0, -4) // mediaconvert will convert to mp4
    const fullS3RawUrl = "s3://toash-climbing-media/" + s3KeyVersioned;
    const fullS3CompressedUrl = "s3://toash-climbing-media/" + compressedS3KeyVersioned;

    // media convert will automatically append an extension.
    const fullS3CompressedUrlWithoutExtension = fullS3CompressedUrl.slice(0, -4);
    console.log({ fullS3RawUrl, fullS3CompressedUrl, fullS3CompressedUrlWithoutExtension });
    let compressResponse;
    // compress media
    try {
      compressResponse = await fetch(import.meta.env.VITE_APP_API_BASE_URL + "/media/compress?deleteRaw=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawUrl: fullS3RawUrl, compressedUrl: fullS3CompressedUrlWithoutExtension })
      });
    } catch (e) {
      console.log("Error calling media compress endpoint", e);
      throw e;
    }
    console.log("Video compression status code: ", compressResponse.status);
    if (compressResponse.status >= 200 && compressResponse.status <= 299) {
      console.log("Media successfully compressed!");

    } else {

      throw new Error("An error occured when trying to compress the media");
    }
  }
};
