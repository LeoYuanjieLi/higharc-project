"use strict"


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

  static drawFace(face, polygons, color="red") {
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
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  }

  static drawAllFacesAlgorithm2(faceName, inputJson) {
    const polygons = new Polygons(inputJson);
    const neighbors = polygons.getNeighborFaces(faceName);
    const face = polygons.faces.get(faceName);
    Draw.drawFace(face, polygons, "pink");
    neighbors.forEach(neiFaceName => {
      Draw.drawFace(polygons.faces.get(neiFaceName), polygons, "green");
    })
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
      // note, i start at 1 because i == 0 is reserved for the whole exterior edges
      const face = polygons.faces.get(faceNames[i]);
      const color = face.faceType === "interior" ? "red" : "blue";
      Draw.drawFace(face, polygons, color);
    }
  }

}

module.exports = {Draw};