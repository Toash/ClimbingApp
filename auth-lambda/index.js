const fetch = require("node-fetch");

const refreshTokens = async (event) => {
  try {
    // Extract refresh token
    const cookieHeader = event.headers?.Cookie || "";
    const refresh_token = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("refresh_token="))
      ?.split("=")[1];

    if (!refresh_token) {
      return {
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": process.env.ORIGIN,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({ error: "No refresh token in cookies" }),
      };
    }

    // Get new token
    const response = await fetch(
      "https://climbing-app.auth.us-east-2.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: process.env.CLIENT_ID,
          refresh_token: refresh_token,
        }),
      }
    );

    const tokenData = await response.json();

    if (!response.ok) {
      throw new Error(tokenData.error_description || "Failed to refresh token");
    }

    // Return token
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.ORIGIN,
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: tokenData.access_token,
        id_token: tokenData.id_token,
      }),
    };
  } catch (error) {
    console.log("Failed to refresh token: ", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": process.env.ORIGIN,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ error: "Failed to refresh token" }),
    };
  }
};

module.exports = { refreshTokens };
