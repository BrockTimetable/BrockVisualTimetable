import { deflateSync, inflateSync } from "fflate";

/*
URL state codec (format v2).

Pipeline:
  state object -> binary pack -> deflate (fflate) -> base64url -> ?s=<string>

The binary layout is documented inline in writeBinary/readBinary below and must
be kept byte-for-byte in sync between the two. The whole decode path is wrapped
in try/catch so any corruption simply yields null (caller treats that as a
"shared timetable no longer exists" error).

The format is tuned for short URLs:
  - tt/term are 1-byte enum indices (with a 0xFF escape for unknown values).
  - pin section IDs are sorted, then stored as varints of the deltas, so the
    clustered IDs of a single term pack into ~1 byte each.
  - sd holds only the selected duration *code* ("2"); the date range is rebuilt
    from course data on restore.
  - col holds only user-customized colors; defaults are re-derived from order.
*/

const SCHEMA_VERSION = 2;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// 1-byte enum tables; 0xFF marks an escape to a length-prefixed string.
const ESCAPE = 0xff;
const TT_TABLE = ["UG", "AD", "PS", "GR"];
const TERM_TABLE = ["FW", "SP", "SU"];

// state.sort ("w"/"d"/undefined) <-> binary sort byte (0/1/2)
const SORT_KEY_TO_BYTE = { w: 1, d: 2 };
const SORT_BYTE_TO_KEY = { 1: "w", 2: "d" };

// Day letter <-> byte
const DAY_TO_BYTE = { M: 0, T: 1, W: 2, R: 3, F: 4, S: 5, U: 6 };
const BYTE_TO_DAY = ["M", "T", "W", "R", "F", "S", "U"];

// "09:00" -> slot index (8AM == slot 0, 30-min granularity)
const timeToSlot = (time) => {
  const [h, m] = time.split(":").map(Number);
  return (h - 8) * 2 + m / 30;
};

// slot index -> "HH:MM"
const slotToTime = (slot) => {
  const hour = Math.floor(slot / 2) + 8;
  const minute = slot % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
};

// Course labels round-trip through a space-stripped, comma-joined string. The
// Brock code format is fixed (AAAA 9A99 D9+) so spaces can be re-inserted
// deterministically on decode.
const stripCourseLabel = (label) => label.replace(/\s+/g, "");
const restoreCourseLabel = (compact) =>
  `${compact.slice(0, 4)} ${compact.slice(4, 8)} ${compact.slice(8)}`;

// "COSC 1P02 D2" -> "COSC1P02" (the space-less course code colors are keyed on).
const courseLabelToCode = (label) => {
  const parts = label.trim().split(/\s+/);
  return `${parts[0] ?? ""}${parts[1] ?? ""}`;
};

const hexToRgb = (hex) => {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ];
};

// Uppercase to match the default color palette in CourseColorsContext, so the
// "used colors" dedup recognizes restored colors when assigning new ones.
const rgbToHex = (r, g, b) => {
  const hex = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  return `#${hex.toUpperCase()}`;
};

const writeBinary = (state) => {
  const bytes = [];

  const pushBytes = (source) => {
    for (let i = 0; i < source.length; i++) bytes.push(source[i]);
  };
  const pushLengthPrefixedString = (str) => {
    const encoded = textEncoder.encode(str);
    bytes.push(encoded.length & 0xff);
    pushBytes(encoded);
  };
  // Enum index byte, or 0xFF escape followed by a length-prefixed string.
  const pushEnum = (value, table) => {
    const index = table.indexOf(value);
    if (index >= 0) {
      bytes.push(index);
    } else {
      bytes.push(ESCAPE);
      pushLengthPrefixedString(value || "");
    }
  };
  // Unsigned LEB128 varint.
  const pushVarint = (value) => {
    let n = value >>> 0;
    while (n > 0x7f) {
      bytes.push((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    bytes.push(n & 0x7f);
  };

  // [1 byte] version
  bytes.push(SCHEMA_VERSION);

  // tt + term enums
  pushEnum(state.tt || "UG", TT_TABLE);
  pushEnum(state.term || "FW", TERM_TABLE);

  // course string (labels space-stripped, comma-joined) + 0x00 terminator
  const courseString = (state.c || []).map(stripCourseLabel).join(",");
  pushBytes(textEncoder.encode(courseString));
  bytes.push(0x00);

  // pins: count, then sorted IDs as varint deltas (first is an absolute varint).
  const pins = (state.p || [])
    .map((id) => Number(id) >>> 0)
    .sort((a, b) => a - b);
  bytes.push(pins.length & 0xff);
  let prev = 0;
  pins.forEach((id) => {
    pushVarint(id - prev);
    prev = id;
  });

  // [1 byte] sort byte
  bytes.push(SORT_KEY_TO_BYTE[state.sort] ?? 0);

  // [1 byte] time block count, then 4+ bytes per block
  const tb = state.tb || [];
  bytes.push(tb.length & 0xff);
  tb.forEach((block) => {
    bytes.push(DAY_TO_BYTE[block.d] ?? 0);
    bytes.push(timeToSlot(block.s) & 0xff);
    bytes.push(timeToSlot(block.e) & 0xff);
    pushLengthPrefixedString(block.n || "");
  });

  // selected duration code ("2"), "" when none
  pushLengthPrefixedString(state.sd || "");

  // color overrides: count, then [course index, R, G, B] per entry. Only colors
  // that differ from the default palette assignment are stored here.
  const courseCodes = (state.c || []).map(courseLabelToCode);
  const colorEntries = Object.entries(state.col || {}).filter(([code]) =>
    courseCodes.includes(code),
  );
  bytes.push(colorEntries.length & 0xff);
  colorEntries.forEach(([code, hex]) => {
    bytes.push(courseCodes.indexOf(code) & 0xff);
    const [r, g, b] = hexToRgb(hex);
    bytes.push(r & 0xff);
    bytes.push(g & 0xff);
    bytes.push(b & 0xff);
  });

  return new Uint8Array(bytes);
};

const readBinary = (bytes) => {
  let offset = 0;

  const readByte = () => {
    if (offset >= bytes.length) throw new Error("Unexpected end of buffer");
    const value = bytes[offset];
    offset += 1;
    return value;
  };

  const readBytes = (length) => {
    if (offset + length > bytes.length) {
      throw new Error("Unexpected end of buffer");
    }
    const slice = bytes.subarray(offset, offset + length);
    offset += length;
    return slice;
  };

  const readLengthPrefixedString = () => {
    const len = readByte();
    return textDecoder.decode(readBytes(len));
  };

  const readEnum = (table, fallback) => {
    const b = readByte();
    if (b === ESCAPE) return readLengthPrefixedString() || fallback;
    return table[b] ?? fallback;
  };

  const readVarint = () => {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = readByte();
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);
    return result >>> 0;
  };

  // version (read for completeness; only v2 is produced)
  readByte();

  // tt + term
  const tt = readEnum(TT_TABLE, "UG");
  const term = readEnum(TERM_TABLE, "FW");

  // course string up to 0x00 terminator
  const courseStart = offset;
  while (offset < bytes.length && bytes[offset] !== 0x00) offset += 1;
  const courseString = textDecoder.decode(bytes.subarray(courseStart, offset));
  offset += 1; // skip terminator
  const c = courseString ? courseString.split(",").map(restoreCourseLabel) : [];

  // pins (varint deltas of sorted IDs)
  const pinCount = readByte();
  const p = [];
  let prev = 0;
  for (let i = 0; i < pinCount; i++) {
    prev += readVarint();
    p.push(String(prev >>> 0));
  }

  // sort
  const sortByte = readByte();
  const sort = SORT_BYTE_TO_KEY[sortByte];

  // time blocks
  const tbCount = readByte();
  const tb = [];
  for (let i = 0; i < tbCount; i++) {
    const d = BYTE_TO_DAY[readByte()] ?? "M";
    const s = slotToTime(readByte());
    const e = slotToTime(readByte());
    const n = readLengthPrefixedString();
    tb.push({ d, s, e, n });
  }

  // selected duration code
  const sd = readLengthPrefixedString();

  // color overrides
  const col = {};
  const colorCount = readByte();
  for (let i = 0; i < colorCount; i++) {
    const index = readByte();
    const r = readByte();
    const g = readByte();
    const b = readByte();
    const label = c[index];
    if (label) col[courseLabelToCode(label)] = rgbToHex(r, g, b);
  }

  const state = { v: SCHEMA_VERSION, tt, term, c, p, tb };
  if (sort) state.sort = sort;
  if (sd) state.sd = sd;
  if (Object.keys(col).length) state.col = col;
  return state;
};

const bytesToBase64Url = (bytes) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const base64UrlToBytes = (str) => {
  let normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) normalized += "=";
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const encodeState = (stateObj) => {
  const packed = writeBinary(stateObj);
  const compressed = deflateSync(packed);
  return bytesToBase64Url(compressed);
};

export const decodeState = (str) => {
  try {
    const compressed = base64UrlToBytes(str);
    const packed = inflateSync(compressed);
    return readBinary(packed);
  } catch {
    return null;
  }
};
