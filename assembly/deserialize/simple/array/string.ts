import { JSON } from "../../..";
import { BACK_SLASH, QUOTE } from "../../../custom/chars";

export function deserializeStringArray(srcStart: usize, srcEnd: usize, dst: usize): string[] {
  const out = dst ? changetype<string[]>(dst) : new Array<string>();
  let lastPos = 2;
  let inString = false;
  while (srcStart < srcEnd) {
    const code = load<u16>(srcStart);
    if (code == QUOTE) {
      if (!inString) {
        inString = true;
        lastPos = srcStart;
      } else if (load<u16>(srcStart - 2) != BACK_SLASH) {
        out.push(JSON.__deserialize<string>(lastPos, srcStart));
        inString = false;
      }
    }
    srcStart += 2;
  }
  return out;
}
