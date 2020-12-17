const { URLSearchParams } = require("url");
const { inspect } = require("util");
const bent = require("bent");

const Http = (function () {
  const RESPONSE_TYPE_JSON = "json";

  const Method = {
    DELETE: "DELETE",
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
  };

  const Query = (function () {
    const appendToPath = (urlPath, params) => {
      if (params == undefined || Object.keys(params).length == 0) {
        return urlPath;
      }

      return `${urlPath}?${new URLSearchParams(params).toString()}`;
    };

    return { appendToPath };
  })();

  const Client = (function () {
    const make = (bent, responseType, baseUrl, headers = {}) => ({
      DELETE: bent(baseUrl, Method.DELETE, responseType, 200, headers),
      GET: bent(baseUrl, Method.GET, responseType, 200, headers),
      POST: bent(baseUrl, Method.POST, responseType, [200, 201], headers),
      PUT: bent(baseUrl, Method.PUT, responseType, 200, headers),
    });

    const request = async (client, { method, path, body, query }) => {
      if (!Object.prototype.hasOwnProperty.call(client, method)) {
        throw new Error(`Could not find base client method for "${method}"`);
      }

      if (typeof client[method] !== "function") {
        throw new TypeError(`
          Provided client object does not have a ${method} function available.

          Found: ${inspect(client[method])}
        `);
      }

      return await client[method](Query.appendToPath(path, query), body);
    };

    return { make, request };
  })();

  const make = (baseUrl) => {
    let baseClient;

    return async (httpCallOptions) => {
      // When the user asks us to set the headers then we need to instantiate
      // a new client for each request.
      if (
        httpCallOptions != undefined &&
        httpCallOptions.headers != undefined
      ) {
        return await Client.request(
          Client.make(
            bent,
            RESPONSE_TYPE_JSON,
            baseUrl,
            httpCallOptions.headers
          ),
          httpCallOptions
        );
      }

      if (baseClient == undefined) {
        baseClient = Client.make(bent, RESPONSE_TYPE_JSON, baseUrl);
      }

      return await Client.request(baseClient, httpCallOptions);
    };
  };

  return { Method, make };
})();

module.exports = { Http };
