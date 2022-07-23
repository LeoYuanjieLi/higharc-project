const Geometry = require('./Geometry');

describe('Geometry methods', function () {
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
    console.log(testGeo.adjList);

  });


});

