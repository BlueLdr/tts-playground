const browserEnv = require("browser-env");
browserEnv(["window", "document"]);
// noinspection JSConstantReassignment
global.localStorage = {
  getItem(key) {
    return "null";
  },
  setItem(key, value) {},
};
