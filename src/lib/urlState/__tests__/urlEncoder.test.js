import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "../urlEncoder";

describe("urlEncoder round-trip", () => {
  it("round-trips a full state object", () => {
    const state = {
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2", "MATH 1P01 D1"],
      p: ["3591102", "3591103"],
      sort: "w",
      tb: [
        { d: "M", s: "09:00", e: "11:00", n: "Work" },
        { d: "W", s: "14:00", e: "16:00", n: "Gym" },
      ],
      sd: "2",
      col: { COSC1P02: "#E74C3C", MATH1P01: "#3498DB" },
    };

    const decoded = decodeState(encodeState(state));
    expect(decoded).toEqual(state);
  });

  it("round-trips the selected duration code and color overrides", () => {
    const state = {
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2"],
      p: ["3591102"],
      tb: [],
      sd: "2",
      col: { COSC1P02: "#9B59B6" },
    };
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("omits sd and col when absent", () => {
    const state = {
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2"],
      p: ["3591102"],
      tb: [],
    };
    const decoded = decodeState(encodeState(state));
    expect(decoded.sd).toBeUndefined();
    expect(decoded.col).toBeUndefined();
    expect(decoded).toEqual(state);
  });

  it("omits sort for the default sort option", () => {
    const state = {
      v: 2,
      tt: "GR",
      term: "SP",
      c: ["PSYC 1F90 D1"],
      p: ["1234567"],
      tb: [],
    };

    const decoded = decodeState(encodeState(state));
    expect(decoded.sort).toBeUndefined();
    expect(decoded).toEqual(state);
  });

  it("sorts pins and round-trips many clustered section IDs", () => {
    const state = {
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2"],
      // intentionally unsorted; decode returns them sorted ascending
      p: ["3591140", "3591102", "3591103", "3591142"],
      tb: [],
    };
    const decoded = decodeState(encodeState(state));
    expect(decoded.p).toEqual(["3591102", "3591103", "3591140", "3591142"]);
  });

  it("escapes unknown tt/term values", () => {
    const state = {
      v: 2,
      tt: "ZZ",
      term: "QQ",
      c: ["COSC 1P02 D2"],
      p: ["3591102"],
      tb: [],
    };
    const decoded = decodeState(encodeState(state));
    expect(decoded.tt).toBe("ZZ");
    expect(decoded.term).toBe("QQ");
  });

  it("handles empty pins and blocks", () => {
    const state = {
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2"],
      p: [],
      tb: [],
    };
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("preserves a blank time-block name", () => {
    const state = {
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2"],
      p: ["3591102"],
      tb: [{ d: "F", s: "08:00", e: "08:30", n: "" }],
    };
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("returns null on corrupt input", () => {
    expect(decodeState("not-valid-base64url!!!")).toBeNull();
    expect(decodeState("")).toBeNull();
  });

  it("produces a URL-safe string with no padding", () => {
    const encoded = encodeState({
      v: 2,
      tt: "UG",
      term: "FW",
      c: ["COSC 1P02 D2"],
      p: ["3591102"],
      tb: [],
    });
    expect(encoded).not.toMatch(/[+/=]/);
  });
});
