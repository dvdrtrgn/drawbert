// http://depts.washington.edu/madlab/proj/dollar/pdollar.html
(function () {
  const C = console;
  // defaults (globals/constants)
  const DEF = {
    numPoints: 33, // lower...fewer
    origin: new Point(0, 0, 0),
  };

  // ================ PRIVATE ====================

  /**
   * Computes the centroid for an array of points
   * @param  {Array} points [description]
   * @return {Array}        [description]
   */
  function centroid(points) {
    let [x, y] = [0, 0];

    for (let i = 0; i < points.length; i++) {
      x += points[i].X;
      y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;

    return new Point(x, y, 0);
  }

  /**
   * Computes the Euclidean Distance between two points in 2D
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  function distance(p1, p2) { // Euclidean distance between two points
    const [dx, dy] = [p2.X - p1.X, p2.Y - p1.Y];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Computes the distance between two point clouds by performing a
   * minimum-distance greedy matching starting with point startIndex
   * @param  {[type]} pts1  [description]
   * @param  {[type]} pts2  [description]
   * @param  {[type]} start [description]
   * @return {[type]}       [description]
   */
  function cloudDistance(pts1, pts2, start) {
    const matched = new Array(pts1.length); // pts1.length == pts2.length
    let [sum, idx] = [0, start];

    for (let i = 0; i < pts1.length; i++) {
      matched[i] = false;
    }
    do {
      let [min, index] = [+Infinity, -1];

      for (let i = 0; i < matched.length; i++) {
        if (!matched[i]) {
          const d = distance(pts1[idx], pts2[i]);
          if (d < min) {
            [min, index] = [d, i];
          }
        }
      }
      const weight = 1 - ((idx - start + pts1.length) % pts1.length) / pts1.length;
      sum += weight * min;
      idx = (idx + 1) % pts1.length;

      matched[index] = true;
    } while (idx != start);

    return sum;
  }

  /**
   * Implements greedy search for a minimum-distance matching between two point clouds
   * @param  {[type]} pts1 [description]
   * @param  {[type]} pts2 [description]
   * @return {[type]}      [description]
   */
  function greedyCloudMatch(pts1, pts2) {
    const e = 0.5;
    const step = Math.floor(Math.pow(pts1.length, 1 - e));
    let min = +Infinity;

    for (let i = 0; i < pts1.length; i += step) {
      const d1 = cloudDistance(pts1, pts2, i);
      const d2 = cloudDistance(pts2, pts1, i);
      min = Math.min(min, Math.min(d1, d2)); // min3
    }
    return min;
  }

  /**
   * Computes the path length for an array of points
   * @param  {[type]} points [description]
   * @return {[type]}        [description]
   */
  function pathLength(points) { // length traversed by a point path
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].ID === points[i - 1].ID) {
        d += distance(points[i - 1], points[i]);
      }
    }
    return d;
  }

  /**
   * Resamples the array of points into n equally-distanced points
   * @param  {Array} points   of points
   * @param  {Number} tot     total intervals
   * @return {Array}
   */
  function resample(points, tot) {
    const I = pathLength(points) / (tot - 1); // interval length
    const newpoints = new Array(points[0]);
    let D = 0;

    for (let i = 1; i < points.length; i++) {
      let p0 = points[i - 1];
      let p1 = points[i];
      if (p1.ID === p0.ID) {
        const d = distance(p0, p1);

        if ((D + d) >= I) {
          const qx = p0.X + ((I - D) / d) * (p1.X - p0.X);
          const qy = p0.Y + ((I - D) / d) * (p1.Y - p0.Y);
          const q = new Point(qx, qy, p1.ID);

          newpoints[newpoints.length] = q; // append new point 'q'
          // insert 'q' at position i in points s.t. 'q' will be the next i
          points.splice(i, 0, q);
          D = 0;
        } else D += d;
      }
    }
    // sometimes we fall a rounding-error short of adding the last point, so add it if so
    if (newpoints.length === tot - 1) {
      newpoints[newpoints.length] = new Point(
        points[points.length - 1].X,
        points[points.length - 1].Y,
        points[points.length - 1].ID);
    }
    return newpoints;
  }

  /**
   * Performs scale normalization with shape preservation into [0..1]x[0..1]
   * @param  {Array} points [description]
   * @return {Array}        [description]
   */
  function scale(points) {
    const newpoints = [];
    let [minX, minY, maxX, maxY] = [+Infinity, +Infinity, -Infinity, -Infinity];

    for (let i = 0; i < points.length; i++) {
      minX = Math.min(minX, points[i].X);
      minY = Math.min(minY, points[i].Y);
      maxX = Math.max(maxX, points[i].X);
      maxY = Math.max(maxY, points[i].Y);
    }
    const size = Math.max(maxX - minX, maxY - minY);

    for (let i = 0; i < points.length; i++) {
      const qx = (points[i].X - minX) / size;
      const qy = (points[i].Y - minY) / size;
      newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
    }
    return newpoints;
  }

  /**
   * Translates the array of points by p
   * @param  {[type]} points [description]
   * @param  {[type]} pt     [description]
   * @return {[type]}        [description]
   */
  function translateTo(points, pt) { // translates points' centroid
    const c = centroid(points);
    const newpoints = [];

    for (let i = 0; i < points.length; i++) {
      const qx = points[i].X + pt.X - c.X;
      const qy = points[i].Y + pt.Y - c.Y;
      newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
    }
    return newpoints;
  }

  /**
   * [normalizePoints description]
   * @param  {[type]} points [description]
   * @return {[type]}        [description]
   */
  function normalizePoints(points) {
    let pts = points.concat(); // protect passed array
    pts = resample(pts, DEF.numPoints);
    pts = scale(pts);
    pts = translateTo(pts, DEF.origin);
    return pts;
  }

  // ================ CLASSES ====================

  /**
   * Implements a 2D Point that exposes X, Y, and StrokeID properties.
   *  StrokeID is the stroke index the point belongs to (e.g., 0, 1, 2, ...)
   *  that is filled by counting pen down/up events.
   * @param       {[type]} x  [description]
   * @param       {[type]} y  [description]
   * @param       {[type]} id [description]
   * @constructor
   */
  function Point(x, y, id) {
    this.X = x;
    this.Y = y;
    this.ID = id; // stroke ID to which this point belongs (1,2,...)
  }

  /**
   * Implements a gesture as a cloud of points (i.e., an unordered set of points).
   * Gestures are normalized with respect to scale, translated to origin, and resampled into a fixed number of 32 points.
   * @param       {[type]} name   [description]
   * @param       {[type]} points [description]
   * @constructor
   */
  function PointCloud(name, points) { // template
    this.name = name;
    this.points = normalizePoints(points);
  }

  function Result(name, score) {
    this.name = name;
    this.score = score;
  }

  // The $P Point-Cloud Recognizer API begins here
  // 3 methods:
  // .recognize()
  // .addGesture()
  // .deleteUserGestures()

  /**
   * Main function of the $P recognizer.
   *  Classifies a candidate gesture against a set of training samples.
   *  Returns the class of the closest neighbor in the training set.
   * @param       {[type]} numPoints [description]
   * @param       {[type]} origin    [description]
   * @constructor
   */
  function Recognizer(numPoints, origin) {
    const Tmpl = this.clouds = [];

    if (typeof numPoints !== 'undefined') {
      DEF.numPoints = numPoints;
    }
    if (typeof origin !== 'undefined') {
      DEF.origin = origin;
    }

    this.recognize = function (points) {
      let [best, idx] = [+Infinity, -1];
      points = normalizePoints(points);

      for (let i = 0; i < Tmpl.length; i++) { // for each point-cloud template
        const dist = greedyCloudMatch(points, Tmpl[i].points);
        if (dist < best) {
          best = dist; // best (least) distance
          idx = i; // point-cloud
        }
      }
      return (idx === -1) ?
        new Result('No match.', 0) :
        new Result(Tmpl[idx].name, Math.max((best - 2) / -2, 0));
    };

    /**
     * Constructs a gesture from an array of points
     * @param  {[type]} name   [description]
     * @param  {[type]} points [description]
     * @return {[type]}        [description]
     */
    this.addGesture = function (name, points) {
      let num = 0;

      Tmpl[Tmpl.length] = new PointCloud(name, points);

      for (let i = 0; i < Tmpl.length; i++) {
        if (Tmpl[i].name === name) {
          num++;
        }
      }
      return num;
    };

    this.deleteUserGestures = function () {
      return Tmpl.length = 0; // clear any beyond the original set
    };
  }

  // ================ PUBLIC ====================

  const PDollar = Object.freeze({
    Point,
    Recognizer,
    normalizePoints,
  });

  if (typeof define === 'function' && define.amd) {
    define(PDollar);
  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PDollar;
  } else {
    window.PDollar = PDollar;
  }
}());
