"use strict"
class Face {
  constructor(edges, faceType="exterior") {
    /**
     * The sort is to make sure same collection of Edges construct same name as
     * a unique ID
     */
    this.edges = edges.sort((a, b) => a.name.localeCompare(b.name));
    this.name = this.edges.map(e => e.name).join("||");
    this.faceType = faceType; // default to be exterior;
    this.verts = new Set();
    this.getVerts();
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