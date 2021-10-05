class TTSCache {
  private cache: { [key: string]: TTS.TTSRequest } = {};

  set = (request: TTS.TTSRequest) => {
    this.cache[request.text] = { ...request };
  };

  remove = (request: TTS.TTSRequest) => {
    delete this.cache[request.text];
  };

  get = (key: string) => {
    return this.cache[key];
  };

  reset = () => {
    Object.keys(this.cache).forEach(key => {
      delete this.cache[key];
    });
  };
}

export const tts_cache = new TTSCache();
