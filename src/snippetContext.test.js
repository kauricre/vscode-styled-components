"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { shouldOfferExpand } = require("./snippetContext");

// The provider fires right after a typed backtick; lineBeforeCursor is the
// line text up to and including that backtick.
const OFFER = [
  "const A = styled.div`",
  "export const B = styled(Button)`",
  "const C = styled.div<{ active?: boolean }>`",
  'const D = styled<Props>("div")`',
  'const E = styled.input.attrs({ type: "text" })`',
  "const F = css`",
  "const G = keyframes`",
  "const H = createGlobalStyle`",
  "const I = injectGlobal`",
  ")`", // multiline styled(...) continuation line
  "))`", // multiline .attrs(...) continuation line
  "}>`", // multiline generic continuation line
  "const StyledDiv = styled.div(({theme}) => `", // arrow function, destructured param
  "const StyledDiv = styled.div((props) => `", // arrow function, bare param
];

const SILENT = [
  "// note: type a backtick ` to open a template",
  "const s = `",
  "const msg = wrap`",
  "const t = html`",
  "const u = styledFoo`", // identifier merely containing 'styled'
  "const v = String.raw`",
  "if (a > b) `", // stray backtick after code
  "export const CallForm = styled(Base)(`", // upstream #446 call-form false positive
];

test("offers the snippet in styled-components tag contexts", () => {
  for (const line of OFFER) {
    assert.ok(shouldOfferExpand(line), `expected OFFER for: ${line}`);
  }
});

test("stays silent outside styled contexts", () => {
  for (const line of SILENT) {
    assert.ok(!shouldOfferExpand(line), `expected SILENT for: ${line}`);
  }
});
