"use strict"

class Face {
  constructor(edges, faceType="exterior") {
    /**
     * The sort is to make sure same collection of Edges construct same name as
     * a unique ID
     */
    this.originName = edges.map(e => e.name).join("||");
    this.edges = edges;
    this.faceType = faceType; // default to be exterior;
    this.verts = new Set();
    this.getVerts();
    const vArray = Array.from(this.verts);
    vArray.sort((a, b) => a - b);
    this.name = vArray.toString();
  }

  getVerts() {
    this.edges.forEach(e => {
      const [start, end] = e.name.split("--");
      this.verts.add(parseInt(start));
      this.verts.add(parseInt(end));
    })
  }
}

module.exports = {Face};