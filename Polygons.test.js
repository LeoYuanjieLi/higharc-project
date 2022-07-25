const {Geometry, Edge, Face} = require('./Polygons');

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
    expect(testGeo.exteriorEdges.size).toBe(8);
  });

  it('should construct a face', () => {
    const Face1 = testGeo.constructFace('0--1');
    const Face2 = testGeo.constructFace('0--2');
    const Face3 = testGeo.constructFace('0--3');
  });

  it('should gen 2 faces', () => {
    testGeo.genAllFaces();
    console.log(testGeo.faces);
  });
});

describe('Advanced Geometry methods', () => {
  const inputJson = {
    "vertices":
      [[0, 0], [0, 1000], [200, 200], [800, 0], [800, 600]],
    "edges": [[0, 1], [0, 2], [2, 3], [1, 2], [2, 4], [3, 4], [1, 4]]
  }
  let testGeo;
  it("should construct a geometry", () => {
    testGeo = new Geometry(inputJson);
  })
  it('should get 10 exterior edges', () => {
    expect(testGeo.exteriorEdges.size).toBe(10);
  });
});


describe('With interior face test case', () => {
  const inputJson = {
    "vertices":
      [
        [0, 0],  // 0
        [1000, 0],  // 1
        [200, 200],  // 2
        [600, 200],  // 3
        [300, 600],  // 4
        [800, 550],  // 5
        [20, 1000],  // 6
        [1024, 996]  // 7
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
        [4, 5]
      ]
  }
  let testGeo;
  it("should construct a geometry", () => {
    testGeo = new Geometry(inputJson);
  })
  it('should get 8 exterior edges', () => {
    expect(testGeo.exteriorEdges.size).toBe(8);
  });
  it('should generate 3 faces', function () {
    testGeo.genAllFaces();
    console.log(testGeo.faces);
  });
});