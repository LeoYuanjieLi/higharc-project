class Edge {
  constructor(v1Id, v2Id, v1, v2) {
    /**
     * @type {v1: Array[Number], v2: Array[Number]}
     */
    this.start = v1Id;
    this.end = v2Id;
    this.name = v1Id.toString() + "--" + v2Id.toString();
    this.startPos = v1;
    this.endPos = v2;
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
    this.adjList = new Map();
    this.edges = this.unweld();
    this.exteriorEdges = new Map();
    this.faces = new Map();
    this.startPtId = this.getStartPtId();
    this.genAdjList();
  }

  genAdjList() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.adjList.set(i, []);
    }
    for (let i = 0; i < this.rawEdges.length; i++) {
      const [start, end] = this.rawEdges[i];
      this.adjList.get(start).push(end);
      this.adjList.get(end).push(start);
    }
  }

  getNextId(curEdge, neighbors, visited, direction="left", nextAngle = 360) {
    const curId = curEdge.end;
    let nextId = -1;
    for (let i = 0; i < neighbors.length; i++) {
      const neiId = neighbors[i];
      const e = this.edges.get(curId.toString() + "--" + neiId.toString());
      const angle = this.edgeAngle(e, this.edges.get(`${curEdge.end}--${curEdge.start}`));
      // trick, use the reverse of current edge so that we bypass the +- 180 degrees headache
      if (direction === "left") {
        if (angle < nextAngle) {
          nextAngle = angle;
          nextId = neiId;
        }
      } else if (direction === "right") {
        if (angle > nextAngle) {
          nextAngle = angle;
          nextId = neiId;
        }
      }
    }

    return nextId;
  }

  constructFace(startEdgeName) {
    /**
     * BFS keep going "right"
     * @type {any}
     */
    const startEdge = this.edges.get(startEdgeName);
    const visited = new Set();
    const allEdges = [startEdge];
    const queue = [startEdge];
    while (queue.length > 0) {
      const curEdge = queue.shift();
      const curId = curEdge.end;
      visited.add(curEdge.name);
      const neighbors = this.adjList.get(curId);

      const nextId = this.getNextId(curEdge, neighbors, visited, "right", 0);
      if (nextId !== -1 && !visited.has(curId.toString() + "--" + nextId.toString())) {
        queue.push(this.edges.get(curId.toString() + "--" + nextId.toString()));
        allEdges.push(this.edges.get(curId.toString() + "--" + nextId.toString()));
        if (nextId === startEdge.start) {
          break;
        }
      }
    }

    return allEdges.length >= 3 ? new Face(allEdges) : null;

  }

  genAllFaces() {
    /**
     * generate all faces interior and exterior, this uses a similar greedy approach
     * (see `constructFace` method) to genExteriorEdges, but instead going "right" as much as
     * possible so that it construct the face.
     */

    // pre-work, add all edges to the queue;
    const queue = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const neighbors = this.adjList.get(i);
      const edgeNames = neighbors.map(neiId => i.toString() + "--" + neiId.toString());
      queue.push(...edgeNames);
    }
    // start the search
    while (queue.length > 0) {
      const current = queue.shift();
      const curFace = this.constructFace(current);  // actual work of construction
      if (curFace != null && !this.faces.has(curFace.name)) {
        this.faces.set(curFace.name, curFace);
      }
    }
  }

  unweld() {
    const unweldedEdges = new Map();
    for (let i = 0; i < this.rawEdges.length; i++) {
      const [start, end] = this.rawEdges[i];
      const e1 = new Edge(start, end, this.vertices[start], this.vertices[end]);
      const e2 = new Edge(end, start, this.vertices[end], this.vertices[start]);
      unweldedEdges.set(e1.name, e1);
      unweldedEdges.set(e2.name, e2);
    }
    return unweldedEdges;
  }

  genExteriorEdges() {
    /**
     * BFS approach, greedy adding the node having the largest angle (< 180) aka going as "left"
     * as possible, until going back to start
     * Note: this will not find all exterior edges however it is guarantee find the edges so that
     * all exterior faces has AT LEAST ONE edge in this group.
     * @type {{}}
     */
    //find "left most" edge
    const neighbors = this.adjList.get(this.startPtId);
    let nextAngle = 0;
    let nextId = -1;
    for (let i = 0; i < neighbors.length; i++) {
      const neiId = neighbors[i];
      const e = this.edges.get(this.startPtId.toString() + "--" + neiId.toString());
      const angle = this.edgeAngle(e);  // using a default edge from the function;
      if (angle > nextAngle) {
        nextAngle = angle;
        nextId = neiId;
      }
    }
    const startEdgeName = this.startPtId.toString() + "--" + nextId.toString();
    const exteriorEdges = this.constructFace(startEdgeName).edges;
  }

  totalEdgeCount() {
    return (this.rawEdges.length - this.exteriorEdges.length) * 2 + this.exteriorEdges.length;
  }

  getStartPtId() {
    const yValues = this.vertices.map(item => item[1]);
    const minYValue = Math.min(...yValues);
    return yValues.indexOf(minYValue);
  }

  getInteriorPointsAndEdges() {

  }

  edgeAngle(e, e0 = new Edge(0, 1, [0, 0], [1, 0])) {
    /**
     * calculate the given edge angle from vector [0, 1];
     * some function borrowed from:
     * https://stackoverflow.com/questions/56147279/how-to-find-angle-between-two-vectors-on-canvas
     * @type {(e1: Edge, e2: Edge) => Number}
     */
    const start0 = e0.startPos;
    const end0 = e0.endPos;
    const firstAngle = Math.atan2(end0[1] - start0[1], end0[0] - start0[0]);
    const start = e.startPos;
    const end = e.endPos;
    const secondAngle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    let angle = secondAngle - firstAngle;
    angle = angle * 180 / Math.PI;
    return angle >= 0 ? angle : angle + 360
  }


}

module.exports = {Geometry: Polygons, Edge, Face};