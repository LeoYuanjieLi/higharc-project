`use strict`

const {Draw} = require("./Draw.js");

main();

function main() {
  const testPolygon = genPolygon();
  Draw.drawPolygon(testPolygon);
}

function genPolygon() {
  return [
    [75, 100],
    [150, 120],
    [150, 140],
    [170, 190],
    [150, 200]
  ];
}