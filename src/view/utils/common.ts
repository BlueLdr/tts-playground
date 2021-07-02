export const ensure_number = (value: any, def: number) => {
  let num = value;
  if (typeof value === "string") {
    num = parseInt(value);
  }
  if (isNaN(num)) {
    return def ?? 0;
  }
  return num;
};
