/**
 * @overview API utility functions.
 */

const querystring = require('querystring');
const nodeFetch = require('node-fetch');

/**
 * Create authorization header.
 * @param  {Object} _             Parameters.
 * @param  {Object} _.credentials Credentials.
 * @return {Object}               Authorization headers.
 */
const authorizationHeader = ({ credentials }) => ({
  Authorization: `${credentials.tokenType} ${credentials.accessToken}`,
});

/**
 * Make a Google API request.
 * @param  {Object}          _           Parameters.
 * @param  {String}          _.url       Url to send the request to.
 * @param  {String}          [_.verb]    HTTP verb to use.
 * @param  {Object}          [_.query]   Query parameters.
 * @param  {Object}          [_.headers] Headers.
 * @param  {Object}          [_.data]    Request body.
 * @return {Promise<Object>}             Response data.
 */
const fetch = async ({ verb = 'GET', url, query, headers, data } = {}) => {
  url = `${url}?${querystring.stringify(query || {})}`;

  const options = { method: verb, headers: {} };

  options.headers['Accept'] = 'application/json';
  options.headers['Content-Type'] = 'application/json';

  if (headers) {
    options.headers = { ...options.headers, ...headers };
  }

  if (verb !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }

  const req = await nodeFetch(url, options);
  const contentType = req.headers.get('content-type');

  let res = null;

  if (contentType && contentType.includes('application/json')) {
    res = await req.json();
  }

  if (!req.ok) throw res || req;

  return res;
};

module.exports = { authorizationHeader, fetch };
