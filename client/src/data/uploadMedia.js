// Uploads media into raw and compressed format. Videos are compressed.
export const uploadMedia = async (s3key, media) => {

  const videoExtensions = [".mp4", ".mov"]
  const extension = s3key.slice(s3key.lastIndexOf(".")).toLowerCase().trim();
  // get presigned url for the specific s3key
  // example s3key: 016bf520-c011-70ee-c024-6761acd7bf31/ForBiggerJoyrides.mp4
  console.log("Getting presigned url by passing the following s3 key: ", s3key);
  let response;
  try {
    response = await fetch(
      import.meta.env.VITE_APP_API_BASE_URL +
      "/media/presigned-upload?" +
      new URLSearchParams({ s3key: "raw/" + s3key }).toString(),
      {
        method: "GET",
      }
    );
  } catch (e) {
    console.log("Error trying to get presigned url: ", e);
    throw e;
  }

  const data = await response.json();
  const presignedUrl = data.presignedUrl;
  const rawS3KeyWithVersion = data.fullUrl;

  console.log("Json object retrieved: ", data);
  console.log("Presigned URL retrieved: ", presignedUrl);
  console.log("Full raw url: ", rawS3KeyWithVersion)

  if (!data || !presignedUrl) {
    throw new Error("Did not get presigned url");
  }

  try {
    // upload file to s3
    console.log("Uploading file to S3 bucket with path: ", rawS3KeyWithVersion);
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

  let compressedWebUrl;
  let compressedVideo = false;
  if (videoExtensions.includes(extension)) {
    compressedVideo = true;
    console.log("Compressing video...")

    const compressedS3KeyWithVersion = rawS3KeyWithVersion.replace("raw", "compressed") // TODO dont depend on this
    compressedWebUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + compressedS3KeyWithVersion;
    //compressedWebUrl = compressedWebUrl.slice(0, -4) // mediaconvert will convert to mp4
    const fullS3RawUrl = "s3://toash-climbing-media/" + rawS3KeyWithVersion
    let fullS3CompressedUrl = "s3://toash-climbing-media/" + compressedS3KeyWithVersion


    const fullCompressedUrlWithoutExtension = fullS3CompressedUrl.slice(0, -4); // TODO use regex
    console.log({ fullRawUrl: fullS3RawUrl, fullCompressedUrl: fullS3CompressedUrl, fullCompressedUrlWithoutExtension })
    let compressResponse;
    // compress media
    try {
      compressResponse = await fetch(import.meta.env.VITE_APP_API_BASE_URL + "/media/compress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawUrl: fullS3RawUrl, compressedUrl: fullCompressedUrlWithoutExtension })
      })
    } catch (e) {
      console.log("Error calling media compress endpoint", e)
      throw e
    }
    console.log("Video compression status code: ", compressResponse.status)
    if (compressResponse.status >= 200 && compressResponse.status <= 299) {
      console.log("Media successfully compressed!")
    } else {
      // TODO: delete raw media
      throw new Error("An error occured when trying to compress the media")
    }
  }
  console.log("Media successfully uploaded to S3");

  const rawWebUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + rawS3KeyWithVersion;
  if (compressedVideo) {
    return compressedWebUrl; // videos should always be compressed
  } else {
    return rawWebUrl // images are not compressed.
  }

};
