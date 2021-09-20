const browserEnv = require("browser-env");
browserEnv(["window", "document"]);

const local_storage_data = {};
// noinspection JSConstantReassignment
global.localStorage = {
  getItem(key) {
    const value = local_storage_data[key];
    return value != null ? value : "null";
  },
  setItem(key, value) {
    local_storage_data[key] = value;
  },
  clear() {
    Object.keys(local_storage_data).forEach(key => {
      delete local_storage_data[key];
    });
  },
};
