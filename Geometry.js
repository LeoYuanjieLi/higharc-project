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

class Geometry {
  constructor(inputJson) {
    this.vertices = inputJson.vertices;
    this.edges = inputJson.edges;

  }

  genAdjList() {
    this.adjList = {};
    for (let i = 0; i < this.vertices.length; i++) {
      this.adjList[i] = [];
    }
    for (let i = 0; i < this.edges.length; i++) {
      const [start, end] = this.edges[i];
      this.adjList[start].push(end);
      this.adjList[end].push(start);
    }
  }
  unweld() {
    const unweldedEdges = [];
    for (let i = 0; i < this.edges.length; i++) {
      const [start, end] = this.edges[i];
      unweldedEdges.push([this.vertices[start], this.vertices[end]]);
    }
    this.unweldedEdges = unweldedEdges;
  }

  exteriorEdges() {

  }

  totalEdgeCount() {
    return (this.edges.length - this.exteriorEdges.length) * 2 + this.exteriorEdges.length;
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
    const firstAngle = Math.atan2(e1.start, e1.end);
    const secondAngle = Math.atan2(e2.start, e2.end);
    const angle = secondAngle - firstAngle;
    return angle * 180 / Math.PI;
  }
}

module.exports = Geometry;