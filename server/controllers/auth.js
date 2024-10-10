import { CognitoJwtVerifier } from "aws-jwt-verify";

// exchange authorization code for the tokens.
export const exchangeCode = async (req, res) => {
  const { authorizationCode } = req.body;
  console.log("authorization code retrieved: ", authorizationCode);

  try {
    const response = await fetch(
      "https://climbing-app.auth.us-east-2.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "6e718pu7haefgts8vp0hveoaa4",
          code: authorizationCode,
          redirect_uri: "https://dggviye68hd6z.cloudfront.net/",
        }),
      }
    );
    const tokenData = await response.json();

    if (!tokenData) {
      throw new Error(
        "Token data could not be retreived (invalid authorization code?)."
      );
    }

    // store in https cookie cause its sensitive data
    res.cookie("refresh_token", tokenData.refresh_token, {
      httpOnly: true, //javascript cannot access the cookie.
      secure: true, //send over encrypted connection
      sameSite: "None",
    });
    console.log("sent cookie!");
    console.log("Token data:", tokenData);

    res.json({
      access_token: tokenData.access_token,
      id_token: tokenData.id_token,
    });
  } catch (error) {
    console.log("Error trying on token exchange: ", error);
    res.status(500).json({ error: `Token exchange failed, ${error}` });
  }
};

// moved to seperate lambda
export const refreshTokens = async (req, res) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) {
    return res.status(403).json({ error: "No refresh token in cookies" });
  }

  try {
    const response = await fetch(
      "https://climbing-app.auth.us-east-2.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: "6e718pu7haefgts8vp0hveoaa4",
          refresh_token: refresh_token,
        }),
      }
    );

    const tokenData = await response.json();

    res.json({
      access_token: tokenData.access_token,
      id_token: tokenData.id_token,
    });
  } catch (error) {
    console.log("Failed to refresh token: ", error);
    res.header(
      "Access-Control-Allow-Origin",
      "https://dggviye68hd6z.cloudfront.net"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(500).json({ error: "Failed to refresh token" });
  }
};


/**
 * Check to see if id_token is valid (not expired)
 * @param {*} req 
 * @param {*} res 
 * @returns {*} {status:true} or {status:false}
 */
export const checkToken = async (req, res) => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-2_CpLLfRhtv",
    tokenUse: "id",
    clientId: "6e718pu7haefgts8vp0hveoaa4",
  });

  if (req.get("Authorization")) {
    try {
      const authHeader = req.get("Authorization");
      const token = authHeader.split(" ")[1];

      console.log("Extracted token: ", token);

      const payload = await verifier.verify(token);
      console.log("Client supplied token is valid. Payload:", payload);
      res.json({ status: true });
    } catch {
      console.log("Client supplied token is invalid.");
      res.json({ status: false });
    }
  }
};
