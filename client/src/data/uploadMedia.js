// Uploads media into raw and compressed format.
export const uploadMedia = async (s3key, media) => {
  //const fullObjectUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + s3key;

  // get presigned url for the specific s3key
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

  const rawUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + rawS3KeyWithVersion;

  console.log("Raw media successfully uploaded.")
  console.log("URL", rawUrl)

  // Call backend to compress the video.
  const compressedUrl = import.meta.env.VITE_APP_MEDIA_S3_URL + "compressed/" + rawS3KeyWithVersion;
  const compressedS3KeyWithVersion = rawS3KeyWithVersion.replace("raw", "compressed")
  // compress media
  const compressResponse = await fetch(import.meta.env.VITE_APP_API_BASE_URL + "/media/compress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rawUrl: "s3://toash-climbing-media/" + rawS3KeyWithVersion, compressedUrl: "s3://toash-climbing-media/" + compressedS3KeyWithVersion })
  })

  if (compressResponse.status >= 200 && compressResponse.status <= 299) {
    console.log("Media successfully compressed!")
  } else {
    // TODO: delete raw media
    throw new Error("An error occured when trying to compress the media")
  }
  console.log("Media successfully uploaded to S3");
  return compressedUrl;
};
