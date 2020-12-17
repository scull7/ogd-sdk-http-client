const test = require("ava");
const { Http } = require("..");

const XKCD_BASE_URL = "https://xkcd.com/";

test("Can retrieve json from XKCD", async (t) => {
  const client = Http.make(XKCD_BASE_URL);
  const response = await client({
    method: Http.Method.GET,
    path: "/614/info.0.json",
  });

  t.assert(response.safe_title === "Woodpecker");
});
