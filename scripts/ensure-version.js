const pkg = require(`${__dirname}/../package.json`);

const release_version = process.env.TTS_RELEASE_VERSION;

if (!release_version) {
  console.error(
    `Failed to ensure release version, TTS_RELEASE_VERSION not set.`
  );
  process.exit(1);
}

if (!pkg || !pkg.version) {
  console.error(
    `Failed to ensure release version, could not get version from package.json.`
  );
  process.exit(1);
}

const pkg_ver = pkg.version.replace(/[^0-9]/g, "");
const rel_ver = release_version.replace(/[^0-9]/g, "");
if (pkg_ver !== rel_ver) {
  console.error(
    `Release version and package.json version do not match (${pkg_ver} !== ${rel_ver}), aborting...`
  );
  process.exit(1);
}
