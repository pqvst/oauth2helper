# oauth2helper
A simple helper for oauth2 requests

## Dependencies
```js
npm i --save oauth request
```
    
## Setup
```js
const OAuth2Helper = rqeuire("./oauth2helper");

// client config
const config = {
  client_id: "MY_CLIENT_ID",
  client_secret: "MY_CLIENT_SECRET",
  redirect_url: "https://fun.com/callback"
};

// api endpoint
const endpoint = {
  base_url: "https://login.microsoftonline.com/common/oauth2/v2.0",
  authorize_path: "/authorize",
  token_path: "/token"
};
    
// my scopes
const scope = [
  'openid',
  'email',
  'profile',
  'offline_access',
  'https://outlook.office.com/Mail.Read'
].join(" ");

// create oauth2helper instance
const oauth = new OAuth2Helper(config, endpoint);
```

## Authorize
```js
router.get("/connect", (req, res) => {
  res.redirect(oauth.url({ response_type: "code", scope }))
});
```

## Callback
```js
router.get("/callback", (req, res) => {
  oauth.verify(req.query, (err, tokens) => {
    /* do something with tokens */
    req.session.tokens = tokens;
  });
});
```
    
## Use
```js
router.get("/fun", (req, res) => {
  const tokens = req.session.tokens;

  // check if tokens have expired, if so, refresh
  oauth.refresh(tokens, (err, newTokens) => {
    /* save new tokens */
    req.session.tokens = tokens = newTokens;
    oauth.request(tokens, { url: "endpoint..." }, (err, resp, body) => {
       /* fun! */
    });
  });
});
```
