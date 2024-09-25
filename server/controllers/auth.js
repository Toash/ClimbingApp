// exchange authorization code for the tokens.
export const exchangeCode = async (req, res) => {
  const { authorizationCode } = req.body;

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
          redirect_uri: process.env.REACT_APP_REDIRECT_URL,
        }),
      }
    );
    const tokenData = await response.json();

    // store in https cookie cause its sensitive data
    res.cookie("refresh_token", tokenData.refresh_token, {
      httpOnly: true, //javascript cannot access the cookie.
      secure: true, //send over encrypted connection
      sameSite: "Strict",
    });

    res.json({
      access_token: tokenData.access_token,
      id_token: tokenData.id_token,
    });
  } catch (error) {
    console.log("Error trying on token exchange: ", error);
    res.status(500).json({ error: "Token exchange failed." });
  }
};

export const refreshToken = async (req, res) => {
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
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
