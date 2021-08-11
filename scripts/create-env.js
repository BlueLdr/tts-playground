// update env var TTS_VERSION with version in package.json

const fs = require("fs");
const version = require("../package.json").version;
const { TTS_VERSION } = process.env;

let env_ = "";
try {
  env_ = fs.readFileSync(`${__dirname}/../.env`, "utf8");
} catch (e) {}

if (!env_ || version !== TTS_VERSION) {
  let output = `export TTS_VERSION=${version}\n`;
  if (env_) {
    if (/export TTS_VERSION=.+\n/.test(env_)) {
      output = env_.replace(/export TTS_VERSION=.+\n/, output);
    } else {
      output = `${output}${env_}`;
    }
  }

  fs.writeFileSync(`${__dirname}/../.env`, output);
}
