class Draw {
  static drawPolygon(polygons) {
    const canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');

      ctx.beginPath();
      const [startX, startY] = data[0]
      ctx.moveTo(startX, startY);  // first pt
      data.slice(1,).forEach(pt => ctx.lineTo(pt[0], pt[1]));
      ctx.closePath();
      ctx.stroke();
    }
  }
}