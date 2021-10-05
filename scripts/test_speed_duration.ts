import { get_tts_data, SPEED_CHARS } from "../src/common";

let hist = [];
const MSG_PER_MIN = 20;
const rate_limit = async <T>(cb: () => Promise<T>) => {
  const now = Date.now();
  hist = hist.filter(t => now - t < 60001);
  if (hist.length < MSG_PER_MIN) {
    hist.push(Date.now());
    return cb();
  }
  return await_timeout(() => {
    hist = hist.slice(1);
    hist.push(Date.now());
    return cb();
  }, hist[0] - (now - 60001));
};

const await_timeout = <T extends any>(cb: () => T, delay) =>
  new Promise<T>(resolve => {
    setTimeout(() => resolve(cb()), delay);
  });

const TEST_CHAR_MAP = {
  [SPEED_CHARS[0]]: "invexc",
  [SPEED_CHARS[1]]: "parens",
  [SPEED_CHARS[2]]: "gte",
};
export const SPEED_TEST_MESSAGE =
  "The FitnessGram™ Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly, but gets faster each minute after you hear this signal. [beep] A single lap should be completed each time you hear this sound. [ding] Remember to run in a straight line, and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark, get ready, start.".replace(
    /\.,\[]/g,
    ""
  );

const onBeforeUnload = e => {
  e.returnValue = "Duration test is running, abandon progress?";
  return "Duration test is running, abandon progress?";
};

const test_speed = async (
  start: number = 1,
  runs: number = 100,
  step: number = 10,
  message?: boolean
) => {
  window.addEventListener("beforeunload", onBeforeUnload, {
    capture: true,
  });

  const max = start + runs;
  const test_results = {};
  const audio = document.getElementById("audio") as HTMLAudioElement;
  const source = document.createElement("SOURCE") as HTMLSourceElement;
  audio.appendChild(source);
  const button = document.createElement("button");
  button.innerText = "Continue";
  button.classList.add("btn", "btn-primary");
  document.querySelector(".tts-main-bottom").appendChild(button);

  const test_one_ = async (
    voice: string,
    char: string,
    count: number,
    msg?: string
  ) => {
    const str = `${msg ? `${msg} ` : ""}${char
      .repeat(Math.ceil(count / char.length))
      .slice(0, count)}`;
    console.log(`str: `, str);
    source.src = await get_tts_data(str, voice);
    audio.load();
    return new Promise(resolve => {
      button.addEventListener(
        "click",
        e => {
          resolve(audio.duration - audio.currentTime);
        },
        { once: true }
      );
    });
  };

  const test_one = (voice: string, char: string, count: number, msg?: string) =>
    rate_limit(() => test_one_(voice, char, count, msg));

  const test_char = async (voice: string, char: string, msg?: string) => {
    const results = {};
    if (!msg) {
      for (let i = start; i < max; i++) {
        results[i] = await test_one(voice, char, i)
          .then(res => {
            results[i] = res;
            console.log(`results${char}][${i}]: `, results[i]);
          })
          .catch(() => {
            button.innerText = "Retry";
            return new Promise<void>(resolve => {
              button.addEventListener(
                "click",
                e => {
                  i--;
                  button.innerText = "Continue";
                  resolve();
                },
                { once: true }
              );
            });
          });
      }
    } else {
      for (let i = start; i <= max; i += step) {
        results[i] = await test_one(voice, char, i, msg);
      }
    }
    return await_timeout(() => results, 1000);
  };

  const msg_parts = [];
  if (message) {
    for (let i = 1; i < 7; i++) {
      msg_parts.push(SPEED_TEST_MESSAGE.slice(0, i * 20));
    }
  }
  const test_message = async (voice: string, char: string) => {
    const results = {};
    for (let msg of msg_parts) {
      results[`${msg.length}`] = await test_char(voice, char, msg);
    }
    return results;
  };

  const test_voice = async (voice: string) => {
    const results: any = {};
    if (!message) {
      for (let char of SPEED_CHARS) {
        results[TEST_CHAR_MAP[char]] = await test_char(voice, char);
      }
      return results;
    }

    for (let char of SPEED_CHARS) {
      results[TEST_CHAR_MAP[char]] = await test_message(voice, char);
    }
    return results;
  };

  for (let voice of ["Brian", "Amy"]) {
    test_results[voice] = await test_voice(voice);
  }

  download_results(test_results, start, runs, message);

  window.removeEventListener("beforeunload", onBeforeUnload, {
    capture: true,
  });

  return test_results;
};

export const json_to_csv_arr = (
  data: object,
  start: number = 1,
  count: number = 100
): string[][] => {
  const max = start + count;
  let header1 = [""];
  let header2 = ["count"];
  let lines = [];
  for (let i = start; i < max; i++) {
    lines.push([i]);
  }

  Object.entries(data).forEach(([name, results]) => {
    header1.push(name);
    for (let i = start; i < max; i++) {
      Object.entries(results).forEach(([k, v]) => {
        if (i === start) {
          header1.push("");
          header2.push(k);
        }
        lines[i - start].push(v[`${i}`]);
      });
      if (i === start) {
        header2.push("");
      }
      lines[i - start].push("");
    }
  });

  return [header1, header2, ...lines];
};

export const json_to_csv_with_msg = (
  data: object,
  start: number = 0,
  count: number = 100,
  step: number = 10
): string[][] => {
  const max = start + count;
  let header1 = ["", ""];
  let header2 = ["msg length", "speed char count"];
  let lines = [];

  Object.entries(data).forEach(([name, char_results], col) => {
    header1.push(name);
    console.log(`name: `, name, col);
    Object.entries(char_results).forEach(
      ([char, results], char_index, char_arr) => {
        console.log(`char: `, char, char_index);
        Object.entries(results).forEach(
          ([msg_len, data], msg_index, msg_arr) => {
            console.log(`msg_len: `, msg_len, msg_index);
            for (let i = start; i <= max; i += step) {
              const line_num = i / step - start + msg_index * (max / step + 1);
              console.log(`line_num: `, line_num);
              console.log(`i, data[i]: `, i, data);
              if (!lines[line_num]) {
                lines.push([i === start ? parseInt(msg_len) : "", i]);
              }

              if (i === start && msg_index === 0) {
                header1.push("");
                header2.push(char);
              }
              lines[line_num].push(data[`${i}`] ?? "");
              if (char_index === char_arr.length - 1) {
                lines[line_num].push("");
              }
              if (
                i === start &&
                msg_index === 0 &&
                char_index === char_arr.length - 1
              ) {
                header2.push("");
              }
            }
          }
        );
      }
    );
  });

  return [header1, header2, ...lines];
};

export const csv_arr_to_csv = (data: string[][]) => {
  const output = data.map(l => l.join(",")).join("\n");
  const download_csv = document.createElement("A") as HTMLAnchorElement;
  download_csv.href = `data:text/csv;charset=utf-8,${encodeURIComponent(
    output
  )}`;
  download_csv.download = "speed-duration.csv";
  document.body.appendChild(download_csv);
  download_csv.click();
};

export const download_results = (
  results: object,
  start: number,
  runs: number,
  message?: boolean
) => {
  const download_json = document.createElement("A") as HTMLAnchorElement;
  download_json.href = `data:application/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(results, null, "  ")
  )}`;
  download_json.download = "speed-duration.json";
  document.body.appendChild(download_json);
  download_json.click();

  const to_csv_arr = message ? json_to_csv_with_msg : json_to_csv_arr;
  csv_arr_to_csv(to_csv_arr(results, start, runs));
};

// @ts-expect-error:
window.download_results = download_results;
// @ts-expect-error:
window.test_speed = test_speed;
export default test_speed;
