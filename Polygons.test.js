const {Geometry, Edge, Face} = require('./Polygons');


describe('Geometry methods', () => {
  const inputJson = {
    "vertices":
      [[0, 0], [200, 0], [200, 200], [0, 200]],
    "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3]]
  }
  let testGeo;
  it("should construct a geometry", () => {
    testGeo = new Geometry(inputJson);
  })

  it('should get the point with minimal y value', () => {
    expect(testGeo.getStartingPt()[1]).toBe(0);
  });

  it('should generate adjList', () => {
    testGeo.genAdjList()
    expect(testGeo.adjList)
      .toEqual(
        { '0': [ 1, 2, 3 ], '1': [ 0, 2 ], '2': [ 1, 0, 3 ], '3': [ 0, 2 ] });

  });

  it('should calculate 90 degrees as angle', () => {
    const e1 = testGeo.unweldedEdges[0];
    const e2 = testGeo.unweldedEdges[2];
    const e3 = testGeo.unweldedEdges[4];
    expect(Geometry.edgeAngle(e1, e2)).toBe(-90);
    expect(Geometry.edgeAngle(e1, e3)).toBe(-45);
    expect(Geometry.edgeAngle(e2, e3)).toBe(45);
  });

});


describe('test Face constructor', () => {
  const e1 = new Edge([0, 0], [200, 0]);
  const e2 = new Edge([200, 0], [200, 200]);
  const e3 = new Edge([200, 200], [0, 0]);
  it('testFace and testFace2 should return same name', () => {
    const testFace = new Face([e1, e2, e3]);
    const testFace2 = new Face([e1, e3, e2]);
    expect (testFace.name).toEqual(testFace2.name);
  });
});