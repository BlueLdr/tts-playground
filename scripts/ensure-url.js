if (!process.env.TTS_URL) {
  console.error(`Error: env var TTS_URL not set`);
  process.exit(1);
}
