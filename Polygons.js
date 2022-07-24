class Edge {
  constructor(v1Id, v2Id) {
    /**
     * @type {v1: Array[Number], v2: Array[Number]}
     */
    this.start = v1Id;
    this.end = v2Id;
    this.name = v1Id.toString() + "--" + v2Id.toString();
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
    this.edgesMap = this.buildMap();
    this.level = 0; // default to be parameter face hence 0;
  }

  buildMap() {
    const _edgesMap = {};
    for (let i = 0; i < this.edges.length; i++) {
      _edgesMap[this.edges[i].name] = this.edges[i];
    }
    return _edgesMap;
  }

}


class Polygons {
  constructor(inputJson) {
    this.vertices = inputJson.vertices;
    this.rawEdges = inputJson.edges;
    this.adjList = {};
    this.edges = this.unweld();
    this.exteriorEdges = {};
    this.faces = {};
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
    const unweldedEdges = {};
    for (let i = 0; i < this.rawEdges.length; i++) {
      const [start, end] = this.rawEdges[i];
      const e1 = new Edge(start, end);
      const e2 = new Edge(end, start);
      unweldedEdges[e1.name] = e1;
      unweldedEdges[e2.name] = e2;
    }
    return unweldedEdges;
  }

  genExteriorEdges() {
    /**
     * BFS, greedly adding the node having the largest angle (< 180), until going back to start
     * @type {{}}
     */
    const startId = this.getStartingPtId();
    const queue = [startId];
    const visited = new Set()
    while (queue.length > 0) {
      const curId = queue.shift();
      visited.add(curId);
      const neighbors = this.adjList[`${curId}`];

      let nextAngle = 361;
      let nextId = 0;

      for (let i = 0; i < neighbors.length; i++) {
        const neiId = neighbors[i];
        if (visited.has(neiId)) {
          continue;
        }
        const e = this.edges[curId.toString() + "--" + neiId.toString()];
        if (this.edgeAngle(e) > -180 && this.edgeAngle(e) < nextAngle) {
          nextAngle = this.edgeAngle(e);
          nextId = neiId;
        }
      }

      if (!visited.has(nextId)) {
        queue.push(nextId);
      }
      this.exteriorEdges[curId.toString() + "--" + nextId.toString()] =
        this.edges[curId.toString() + "--" + nextId.toString()];
    }

  }

  totalEdgeCount() {
    return (this.rawEdges.length - this.exteriorEdges.length) * 2 + this.exteriorEdges.length;
  }

  getStartingPtId() {
    const yValues = this.vertices.map(item => item[1]);
    const minYValue = Math.min(...yValues);
    const idx = yValues.indexOf(minYValue);
    return idx;
  }

  getInteriorPointsAndEdges() {

  }

  edgeAngle(e) {
    /**
     * calculate the given edge angle from vector [0, 1];
     * some function borrowed from:
     * https://stackoverflow.com/questions/56147279/how-to-find-angle-between-two-vectors-on-canvas
     * @type {(e1: Edge, e2: Edge) => Number}
     */
    const firstAngle = Math.atan2(1, 0);
    const start = this.vertices[e.start];
    const end = this.vertices[e.end];
    const secondAngle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    const angle = secondAngle - firstAngle;
    return angle * 180 / Math.PI;
  }


}

module.exports = {Geometry: Polygons, Edge, Face};