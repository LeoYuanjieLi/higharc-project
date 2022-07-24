class Edge {
  constructor(v1, v2) {
    /**
     * @type {v1: Array[Number], v2: Array[Number]}
     */
    this.start = v1;
    this.end = v2;
    this.name = v1.toString() + "--" + v2.toString();
  }

}

class Face {
  constructor(Edges) {
    /**
     * The sort is to make sure same collection of Edges construct same name as
     * a unique ID
     */
    this.edges = Edges.sort((a, b) => a.name.localeCompare(b.name));
    this.name = this.edges.map(e => e.name).join("||");
  }
}


class Polygons {
  constructor(inputJson) {
    this.vertices = inputJson.vertices;
    this.rawEdges = inputJson.edges;
    this.adjList = {};
    this.unweldedEdges = this.unweld()
  }

  genAdjList() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.adjList[i] = [];
    }
    for (let i = 0; i < this.rawEdges.length; i++) {
      const [start, end] = this.rawEdges[i];
      this.adjList[start].push(end);
      this.adjList[end].push(start);
    }
  }

  unweld() {
    const unweldedEdges = [];
    for (let i = 0; i < this.rawEdges.length; i++) {
      const [start, end] = this.rawEdges[i];
      unweldedEdges.push(new Edge(this.vertices[start], this.vertices[end]));
      unweldedEdges.push(new Edge(this.vertices[end], this.vertices[start]));
    }
    return unweldedEdges;
  }

  exteriorEdges() {

  }

  totalEdgeCount() {
    return (this.rawEdges.length - this.exteriorEdges.length) * 2 + this.exteriorEdges.length;
  }

  getStartingPt() {
    const yValues = this.vertices.map(item => item[1]);
    const minYValue = Math.min(...yValues);
    const idx = yValues.indexOf(minYValue);
    return this.vertices[idx];
  }

  getInteriorPointsAndEdges() {

  }

  static edgeAngle(e1, e2) {
    /**
     *
     * @type {(e1: Edge, e2: Edge) => Number}
     */
    const firstAngle = Math.atan2(e1.end[0] - e1.start[0], e1.end[1] - e1.start[1]);
    const secondAngle = Math.atan2(e2.end[0] - e2.start[0], e2.end[1] - e2.start[1]);
    const angle = secondAngle - firstAngle;
    return angle * 180 / Math.PI;
  }


}

module.exports = {Geometry: Polygons, Edge, Face};