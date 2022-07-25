const {Geometry, Edge, Face} = require('./Polygons');


describe('Basic Geometry methods', () => {
  const inputJson = {
    "vertices":
      [[0, 0], [200, 0], [200, 200], [0, 200]],
    "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3]]
  }
  let testGeo;
  it("should construct a geometry", () => {
    testGeo = new Geometry(inputJson);
  })

  it('should get the point Id with minimal y value', () => {
    expect(testGeo.startPtId).toBe(0);
  });

  it('should generate adjList', () => {
    testGeo.genAdjList()
    expect(Object.fromEntries(testGeo.adjList))
      .toEqual(
          { 0: [ 1, 2, 3 ],
          1: [ 0, 2 ],
          2: [ 1, 0, 3 ],
          3: [ 0, 2 ] });
  });

  it('should calculate 90 degrees as angle', () => {
    const e1 = testGeo.edges.get('0--1');
    const e2 = testGeo.edges.get('1--2');
    const e3 = testGeo.edges.get('0--2');
    expect(testGeo.edgeAngle(e1)).toBe(0);
    expect(testGeo.edgeAngle(e2)).toBe(90);
    expect(testGeo.edgeAngle(e3)).toBe(45);
  });

  it('should get 3 exterior edges', () => {
    testGeo.genExteriorEdges();
    console.log(testGeo.exteriorEdges);
  });

  it('should construct a face', () => {
    const Face1 = testGeo.constructFace('0--1');
    console.log(Face1.name);
    const Face2 = testGeo.constructFace('0--2');
    console.log(Face2.name);
    const Face3 = testGeo.constructFace('0--3');
    console.log(Face3.name);
  });

  it('should gen 2 faces', () => {
    testGeo.genAllFaces();
    // console.log(testGeo.faces);
  });
});

// describe('Advanced Geometry methods', () => {
//   const inputJson = {
//     "vertices":
//       [[0, 0], [0, 1000], [200, 200], [800, 0], [800, 600]],
//     "edges": [[0, 1], [0, 2], [2, 3], [1, 2], [2, 4], [3, 4], [1, 4]]
//   }
//   let testGeo;
//   it("should construct a geometry", () => {
//     testGeo = new Geometry(inputJson);
//   })
//   it('should get 3 exterior edges', () => {
//     testGeo.genExteriorEdges();
//     console.log(testGeo.exteriorEdges);
//   });
//
// });
//
//
// describe('test Face constructor', () => {
//   const e1 = new Edge([0, 0], [200, 0]);
//   const e2 = new Edge([200, 0], [200, 200]);
//   const e3 = new Edge([200, 200], [0, 0]);
//   it('testFace and testFace2 should return same name', () => {
//     const testFace = new Face([e1, e2, e3]);
//     const testFace2 = new Face([e1, e3, e2]);
//     expect (testFace.name).toEqual(testFace2.name);
//   });
// });