`use strict`

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
  constructor(edges, faceType="exterior") {
    /**
     * The sort is to make sure same collection of Edges construct same name as
     * a unique ID
     */
    this.originName = edges.map(e => e.name).join("||");
    this.edges = edges.sort((a, b) => a.name.localeCompare(b.name));
    // this.name = this.edges.map(e => e.name).join("||");
    this.faceType = faceType; // default to be exterior;
    this.verts = new Set();
    this.getVerts();
    this.name = Array.from([...this.verts].sort()).toString();

  }

  getVerts() {
    this.edges.forEach(e => {
      const [start, end] = e.name.split("--");
      this.verts.add(parseInt(start));
      this.verts.add(parseInt(end));
    })
  }
}

class Polygons {
  constructor(inputJson) {
    this.vertices = inputJson.vertices;
    this.rawEdges = inputJson.edges;
    this.adjList = new Map();
    this.visitedEdges = new Set();
    this.edges = this.genEdges();
    this.exteriorEdges = new Map();
    this.faces = new Map();
    this.interiorFaces = [];
    this.startPtId = this.getStartPtId();
    this.genAdjList();
    this.genExteriorEdges();
    this.genAllFaces();
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

  getNextId(curEdge, neighbors) {
    const curId = curEdge.end;
    let nextId = -1;
    let nextAngle = 0;
    for (let i = 0; i < neighbors.length; i++) {
      const neiId = neighbors[i];
      const e = this.edges.get(curId.toString() + "--" + neiId.toString());
      const angle = this.edgeAngle(e, this.edges.get(`${curEdge.end}--${curEdge.start}`));
      // trick, use the reverse of current edge so that we bypass the +- 180 degrees headache
      if (angle > nextAngle) {
        nextAngle = angle;
        nextId = neiId;
      }
    }

    return nextId;
  }

  constructFace(startEdgeName, faceType="interior") {
    /**
     * BFS keep going "right"
     * @type {any}
     * time complexity O(v^2), v is vertices number
     */
    const startEdge = this.edges.get(startEdgeName);
    // const visited = new Set();
    const allEdges = [startEdge];
    const queue = [startEdge];
    if (this.exteriorEdges.has(startEdge.name)) {
      faceType = "exterior";
    }
    while (queue.length > 0) {
      const curEdge = queue.shift();
      const curId = curEdge.end;
      // visited.add(curEdge.name);
      const neighbors = this.adjList.get(curId);

      const nextId = this.getNextId(curEdge, neighbors);
      const name = curId.toString() + "--" + nextId.toString();
      if (nextId !== -1) {
        if (this.exteriorEdges.has(name)) {
          faceType = "exterior";
        }
        queue.push(this.edges.get(name));
        allEdges.push(this.edges.get(name));
        this.visitedEdges.add(name);
        if (nextId === startEdge.start) {
          break;
        }
      }
    }

    return allEdges.length >= 3 ? new Face(allEdges, faceType) : null;

  }

  genAllFaces() {
    /**
     * generate all faces interior and exterior, this uses a similar greedy approach
     * (see `constructFace` method) to genExteriorEdges, but instead going "right" as much as
     * possible so that it construct the face.
     * time complexity O(e * v^2), v is vertices number, e is edge count
     */

      // pre-work, add all edges to the queue;
    const queue = [];
    // const visitedEdges = new Set();
    for (let i = 0; i < this.vertices.length; i++) {
      const neighbors = this.adjList.get(i);
      const edgeNames = neighbors.map(neiId => i.toString() + "--" + neiId.toString());
      // const filteredName = edgeNames.filter(name => !this.exteriorEdges.has(name));
      queue.push(...edgeNames);
    }
    // start the search
    while (queue.length > 0) {
      const current = queue.shift();
      if (!this.visitedEdges.has(current)) {
        this.visitedEdges.add(current);
        const curFace = this.constructFace(current);  // actual work of construction
        if (curFace != null && !this.faces.has(curFace.name)) {
          this.faces.set(curFace.name, curFace);
        }
      }
    }
  }

  getInteriorFaceNames() {
    if (this.interiorFaces.length > 0) {
      return this.interiorFaces;
    }

    const keys = Array.from(this.faces.keys());
    keys.forEach(k => {
      const face = this.faces.get(k);
      face.faceType === "interior" ? this.interiorFaces.push(face.name) : null;
    })
    return this.interiorFaces;
  }

  genEdges() {
    const edges = new Map();
    for (let i = 0; i < this.rawEdges.length; i++) {
      const [start, end] = this.rawEdges[i];
      const e1 = new Edge(start, end, this.vertices[start], this.vertices[end]);
      const e2 = new Edge(end, start, this.vertices[end], this.vertices[start]);
      edges.set(e1.name, e1);
      edges.set(e2.name, e2);
    }
    return edges;
  }

  genExteriorEdges() {
    /**
     * BFS approach, greedy adding the node having the largest angle (< 180) aka going as "left"
     * as possible, until going back to start
     * Note: this has side effect, marking exterior nodes as well.
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
    const face = this.constructFace(startEdgeName);
    face.faceType = "allExterior";  // bad practice... bur for now
    this.faces.set(face.name, face);
    if (!this.visitedEdges.has(startEdgeName)) {
      this.visitedEdges.add(startEdgeName);
      const exteriorPolygon = this.constructFace(startEdgeName).edges;
      exteriorPolygon.forEach(e => {
        this.exteriorEdges.set(e.name, e);
        this.exteriorEdges.set(`${e.end}--${e.start}`, this.edges.get(`${e.end}--${e.start}`));
        // add reverse edges as well
      });
      this.exteriorPts = new Set();
      this.exteriorEdges.forEach(e => {
        this.exteriorPts.add(e.start);
        this.exteriorPts.add(e.end);})
    }
  }

  getStartPtId() {
    const yValues = this.vertices.map(item => item[1]);
    const minYValue = Math.min(...yValues);
    return yValues.indexOf(minYValue);
  }

  edgeAngle(e, e0 = new Edge(0, 1, [0, 0], [1, 0])) {
    /**
     * this is the key helper method use for identifying a face && getting the exterior
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

  getNeighborFaces(originFaceName) {
    const originFace = this.faces.get(originFaceName);
    const verts = Array.from(originFace.verts);
    const result = new Set();
    verts.forEach(v => {
      const neighbors = this.adjList.get(v);
      neighbors.forEach( n => {
        const face = this.constructFace(`${v}--${n}`);
        originFace.name !== face.name ? result.add(face.name) : null;

      })
    })

    return Array.from(result);
  }
}

class Draw {

  static drawPolygon(polygons) {
    const canvas = document.getElementById('canvas');
    const edges = Array.from(polygons.edges.values());
    const edgesXY = [];
    edges.forEach(e => {
      const start = e.startPos;
      const end = e.endPos;
      edgesXY.push([start, end]);
    })

    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');

      ctx.beginPath();
      for (let i = 0; i < edgesXY.length; i++) {
        const [start, end] = edgesXY[i];
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  static drawFace(faceName, polygons) {
    const face = polygons.faces.get(faceName);
    const orderedEdges = face.originName.split("||");
    const firstEdge = polygons.edges.get(orderedEdges[0])
    const firstPt = firstEdge.startPos;
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(firstPt[0], firstPt[1]);
      for (let i = 0; i < orderedEdges.length; i++) {
        const edge = polygons.edges.get(orderedEdges[i]);
        ctx.lineTo(edge.endPos[0], edge.endPos[1]);
      }
      if (face.faceType === "allExterior") {
        ctx.fillStyle = "purple";
      } else {
        face.faceType === "interior" ? ctx.fillStyle = "red" : ctx.fillStyle = "blue";
      }
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  }

  static drawAllFacesAlgorithm1(inputJson) {
    /**
     * draw all faces of inputJson (vertices and edges), interior faces are colored red, exterior faces
     * are colored blue;
     * @type {Polygons}
     */
    const polygons = new Polygons(inputJson);
    const faceNames = Array.from(polygons.faces.keys());
    for (let i = 1; i < faceNames.length; i++) {
      Draw.drawFace(faceNames[i], polygons);
    }
  }

}


const inputJson = {
  "vertices":
    [
      [50, 50],  // 0
      [1000, 50],  // 1
      [200, 200],  // 2
      [600, 200],  // 3
      [300, 600],  // 4
      [800, 550],  // 5
      [20, 1000],  // 6
      [1024, 996],  // 7
      [1100, 1024],  // 8
      [1111, 1065],  // 9
      [900,  900]  // 10
    ],
  "edges":
    [
      [0, 1],
      [1, 7],
      [6, 7],
      [0, 6],
      [2, 0],
      [1, 3],
      [2, 3],
      [4, 2],
      [3, 5],
      [4, 5],
      [7, 8],
      [9, 8],
      [7, 9],
      [4, 10],
      [10, 5]
    ]
}

Draw.drawAllFacesAlgorithm1(inputJson);
