/**
 * Created by Philip on 2016-05-15.
 */

const OAuth2 = require("oauth").OAuth2;
const request = require("request");


function unix() {
  return Math.floor(Date.now() / 1000);
}


const OAuth2Helper = function (config, endpoint) {
  this._config = config;
  this._endpoint = endpoint;
  this._oauth2 = new OAuth2(config.client_id, config.client_secret, endpoint.base_url, endpoint.authorize_path, endpoint.token_path);
};


OAuth2Helper.prototype.url = function (params) {
  params = Object.assign({}, params, {
    redirect_uri: this._config.redirect_url
  });
  return this._oauth2.getAuthorizeUrl(params);
};


OAuth2Helper.prototype.verify = function (query, done) {
  const params = {
    grant_type: "authorization_code",
    redirect_uri: this._config.redirect_url
  };
  this._oauth2.getOAuthAccessToken(query.code, params, (err, at, rt, res) => {
    if (err) return done(err);
    res.refresh_token = rt;
    res.created_at = moment().unix();
    done(null, res);
  });
};


OAuth2Helper.prototype.expired = function (tokens) {
  const created = tokens.created_at;
  const expires = tokens.expires_in;

  // test for expiration
  const now = unix();
  const exp = created + expires;
  return exp >= now;
};


OAuth2Helper.prototype.refresh = function (tokens, done) {
  // check if expired
  if (!this.expired(tokens)) {
    return done(null, tokens);
  }

  // get new tokens
  const params = {
    grant_type: "refresh_token"
  };
  this._oauth2.getOAuthAccessToken(tokens.refresh_token, params, (err, at, rt, res) => {
    if (err) return done(err);
    res.refresh_token = rt;
    res.created_at = unix();
    done(null, res);
  });
};


OAuth2Helper.prototype.request = function (tokens, opts, done) {
  if (!opts.headers) opts.headers = {};
  opts.headers.Authorization = "Bearer " + tokens.access_token;
  request(opts, done);
};


module.exports = OAuth2Helper;
