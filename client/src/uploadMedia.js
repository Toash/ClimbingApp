/**
 * Frontend wrapper for putting an object in an s3 bucket.
 * Gets presigned url from backend and uses it to put media into an s3 bucket.
 * @param {String} s3key
 * @param {File} media
 */
export const uploadMedia = async (s3key, media) => {
  //const fullObjectUrl = process.env.REACT_APP_MEDIA_S3_URL + s3key;

  // get presigned url for the specific s3key
  console.log("Getting presigned url by passing the following s3 key: ", s3key);
  let response;
  try {
    response = await fetch(
      process.env.REACT_APP_API_BASE_URL +
      "/media/presigned-upload?" +
      new URLSearchParams({ s3key: s3key }).toString(),
      {
        method: "GET",
      }
    );
  } catch (e) {
    console.log("Error trying to get presigned url: ", e);
  }

  const data = await response.json();
  const presignedUrl = data.presignedUrl;
  const s3KeyWithVersion = data.fullUrl;

  console.log("Json object retrieved: ", data);
  console.log("Presigned URL retrieved: ", presignedUrl);

  if (!data || !presignedUrl) {
    throw new Error("Did not get presigned url");
  }

  // upload file to s3
  console.log("Uploading file to S3 bucket with path: ", s3KeyWithVersion);
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

  console.log("Media successfully uploaded to S3");
  return process.env.REACT_APP_MEDIA_S3_URL + s3KeyWithVersion;
};
