class Draw {
  static drawPolygon(polygons) {
    const canvas = document.getElementById('canvas');
    // if (canvas.getContext) {
    //   const ctx = canvas.getContext('2d');
    //
    //   ctx.beginPath();
    //   const [startX, startY] = polygons[0];
    //   ctx.moveTo(startX, startY);  // first pt
    //   polygons.slice(1,).forEach(pt => ctx.lineTo(pt[0], pt[1]));
    //   ctx.closePath();
    //   ctx.stroke();
    // }
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');

      // Filled triangle
      ctx.beginPath();
      ctx.moveTo(25, 25);
      ctx.lineTo(105, 25);
      ctx.lineTo(25, 105);
      ctx.fill();

      // Stroked triangle
      ctx.beginPath();
      ctx.moveTo(125, 125);
      ctx.lineTo(125, 45);
      ctx.lineTo(45, 125);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

module.exports = {Draw};