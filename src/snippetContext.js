"use strict";
// Should the "expand template string" completion be offered for a backtick
// the user just typed? lineBeforeCursor includes that backtick. Line-based on
// purpose: the multiline wrapper shapes end in the continuation forms the
// grammar itself recognises ( ")`", "))`", "}>`" ).
const TAG_BEFORE_BACKTICK = new RegExp(
  "(?:" +
    // styled.div / styled(Button) / styled("div") / styled<P>("div") /
    // chained members like .attrs(...) — with an optional <generic>.
    "\\bstyled\\s*(?:<[^`]*>\\s*)?(?:\\.\\s*[A-Za-z_$][\\w$]*|\\([^`]*\\))+(?:\\s*<[^`]*>)?" +
    "|\\b(?:css|keyframes|createGlobalStyle|injectGlobal|extend)" +
    "|^\\s*(?:\\)\\)?|}>)" +
    ")\\s*`$"
);

function shouldOfferExpand(lineBeforeCursor) {
  return TAG_BEFORE_BACKTICK.test(lineBeforeCursor);
}

module.exports = { shouldOfferExpand };
