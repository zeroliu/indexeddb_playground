export function generateString(sizeInKb: number) {
  return new Array(Math.floor((sizeInKb * 1024) / 4 + 1)).join('abcd');
}
