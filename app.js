import express from "express";
import session from "express-session";

const app = express();

app.use(session({ resave: false, saveUninitialized: false, secret: "123" }));

// Första steget är att få en access code från GitHub.
// Vi omdirigerar requests till Github där man sedan får logga in.
app.get("/auth/github", (_req, res) => {
  const authUrl =
    "https://github.com/login/oauth/authorize?client_id=b68e6874e5f21942b543"; //Client ID finns i inställningarna för GitHub.
  res.redirect(authUrl);
});

// Hit kommer vi med en kod som kan användas för att bytas mot en token.
app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;

  // Här får vi själva access_token
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: "b68e6874e5f21942b543",
      client_secret: "",//Din nyckel
      code: code,
    }),
    // Vi vill ha vår token i JSON-format
    headers: {
      Accept: "application/json",
    },
  });
  const jsonResponse = await response.json();
  req.session.username = await getUserInfoFromGitHub(jsonResponse.access_token)
  res.send("Authentication successful!");
});

const getUserInfoFromGitHub = async (access_token) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return await response.json();
};

//Hämtar användarinformation med token
app.get("/user", async (req, res) => {
  if (!req.session.access_token) {
    res.status(403).send("Access Denied.");
  }

  res.send(await response.json());
});

app.listen(3000, () => console.log("Server running on port 3000"));
