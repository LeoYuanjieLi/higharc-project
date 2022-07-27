# Higharc Project
A humble attempt to implement some fun algorithms in javascript (as vanilla as possible)

## TL;DR

### View result of Algorithms 1 & 2
In `App.js`, enable `line 378`
```javascript
Draw.drawAllFacesAlgorithm1(inputJson); // use this to view algorithm 1 result;
// Draw.drawAllFacesAlgorithm2("0,1,2,3", inputJson); // use this to view algo 2 result;
// Draw.drawAllFacesAlgorithm2("4,5,10", inputJson); // use this to view algo 2 result;
// Draw.drawAllFacesAlgorithm2("7,8,9", inputJson); // use this to view algo 2 result;
// Draw.drawAllFacesAlgorithm2("0,1,2,3,4,5,6,7,10", inputJson); // use this to view algo 2 result;
```
The main idea of the algorithm is not very clever, the `Polygon.constructFace` does the most of the work
by construct a single `Face` object. The way `constructFace` method simply uses a greedy algorithm to search
for the `right most` edge from the current edge (see helper function `getNextId` and `edgeAngle`).

The whole process goes in this order:

1. find the very top vertices, then draw a line from this point to direction (x:1, y:0), and find
the rightmost edges (rotate clockwise) from this direction.
2. use this edge, apply `constructFace` function, this way, you can build the parameter of the polygons,
simply recorded the visited edges.
3. Now, use a BFS fashion, put all edges as starting edge, except for the one visited in step 2, note that
edges has direction, `1-2` is not the same as `2-1`, tag the face as `exterior` if any edge is in 
`exterior edge`, otherwise, tag as `interior`.

After we build above data structure, retrieving the interior faces (algorithm 1) is trivial. 
Just loop through them. Hence, time complexity is `e` (angle comparison time each time) * `v`
(number of nodes we visited). However because `e` and `v` are correlated, this is just a loose
upper bound.

The neighbor search is also trivial. You just have to rerun construct face from all edges and check if 
the face is the original face. Faces are guaranteed to be unique with the incrementally sorted vertex Ids
i.e. face name `0,1,2` would be a name of face contains `0-1`, `1-2`, `0-2`.

Algorithm 2 worst case, you can get `v*e` as well.

Algorithm 4 is just the extension of algorithm 2 (add a BFS and build a graph), 
because time limitation and my rust js skills I will not implement it at the moment

Algorithm 3 is more tricky. Ideally, you have several zones in your XY world plain (build it as a 
quad-tree). Then you can quickly eliminate spaces. For the sake of this assignment, we can use
https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/ this brute force
approach.


## Run locally
```bash
npm install
npm run dev
```

## Test
```bash
npm run test
```
## Disclaimer

As the assignment mentioned, I am using JavaScript as vanilla js as possible, hence I 
encounter some troubles while trying to `import`, `require` js files. To bypass
those hassle, I squeeze all `Draw`, `Edge`, `Face`, `Polygon` classes (yes they 
are classes I am an old school OOP person) into `App.js`. These days I cannot live
without `create-react-app` for any frontend development. Configuration is a pain.
Would love to learn some more js/ts stuff from you :)




## TODO:

- [x] hash face name with verts;
- [x] modify neighbor function so that point touching does not count as neighbors
- [x] documentations