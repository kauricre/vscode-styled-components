"use strict";
const path = require("path");
const Mocha = require("mocha");

function run() {
  const mocha = new Mocha({ ui: "tdd", timeout: 60000 });
  mocha.addFile(path.resolve(__dirname, "probe.test.js"));
  return new Promise((resolve, reject) => {
    try {
      mocha.run((failures) =>
        failures ? reject(new Error(`${failures} failed`)) : resolve()
      );
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.run = run;
