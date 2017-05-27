// http://depts.washington.edu/madlab/proj/dollar/pdollar.html
(function () {
  // globals (constants?)
  let NumPoints = 32;
  let Origin = new Point(0, 0, 0);

  // ================ CLASSES ====================

  function Point(x, y, id) {
    this.X = x;
    this.Y = y;
    this.ID = id; // stroke ID to which this point belongs (1,2,...)
  }

  function PointCloud(name, points) { // template
    this.name = name;
    this.points = resample(points, NumPoints);
    this.points = scale(this.points);
    this.points = translateTo(this.points, Origin);
  }

  function Result(name, score) {
    this.name = name;
    this.score = score;
  }

  // The $P Point-Cloud Recognizer API begins here

  function Recognizer(_NumPoints, _Origin) {
    // 3 methods:
    //    recognize()
    //    addGesture()
    //    deleteUserGestures()

    if (typeof _NumPoints !== 'undefined') {
      NumPoints = _NumPoints;
    }

    if (typeof _Origin !== 'undefined') {
      Origin = _Origin;
    }

    this.PointClouds = [];

    this.recognize = function (points) {
      points = resample(points, NumPoints);
      points = scale(points);
      points = translateTo(points, Origin);

      let b = +Infinity;
      let u = -1;
      // for each point-cloud template
      for (let i = 0; i < this.PointClouds.length; i++) {
        const d = greedyCloudMatch(points, this.PointClouds[i]);
        if (d < b) {
          b = d; // best (least) distance
          u = i; // point-cloud
        }
      }
      return (u == -1) ?
        new Result('No match.', 0.0) :
        new Result(this.PointClouds[u].name, Math.max((b - 2.0) / -2.0, 0.0));
    };

    this.addGesture = function (name, points) {
      let num = 0;
      this.PointClouds[this.PointClouds.length] = new PointCloud(name, points);

      for (let i = 0; i < this.PointClouds.length; i++) {
        if (this.PointClouds[i].name == name) {
          num++;
        }
      }
      return num;
    };

    this.deleteUserGestures = function () {
      this.PointClouds.length = 0; // clear any beyond the original set
      return 0;
    };
  }

  function initDefaultGestures(recognizer) {
    window._initGestures && window._initGestures(Point, recognizer);
    // This is to indicate that the operation was destructive.
    return null;
  }

  // ================ PRIVATE ====================

  function greedyCloudMatch(points, P) {
    const e = 0.50;
    const step = Math.floor(Math.pow(points.length, 1 - e));
    let min = +Infinity;

    for (let i = 0; i < points.length; i += step) {
      const d1 = cloudDistance(points, P.points, i);
      const d2 = cloudDistance(P.points, points, i);
      min = Math.min(min, Math.min(d1, d2)); // min3
    }
    return min;
  }

  function cloudDistance(pts1, pts2, start) {
    const matched = new Array(pts1.length); // pts1.length == pts2.length
    let sum = 0;
    let idx = start;

    for (let i = 0; i < pts1.length; i++) {
      matched[i] = false;
    }

    do {
      let index = -1;
      let min = +Infinity;

      for (let j = 0; j < matched.length; j++) {
        if (!matched[j]) {
          const d = distance(pts1[idx], pts2[j]);
          if (d < min) {
            min = d;
            index = j;
          }
        }
      }
      matched[index] = true;

      const weight = 1 - ((idx - start + pts1.length) % pts1.length) / pts1.length;
      sum += weight * min;
      idx = (idx + 1) % pts1.length;
    } while (idx != start);

    return sum;
  }

  function resample(points, n) {
    const I = pathLength(points) / (n - 1); // interval length
    const newpoints = new Array(points[0]);
    let D = 0.0;

    for (let i = 1; i < points.length; i++) {
      if (points[i].ID == points[i - 1].ID) {
        const d = distance(points[i - 1], points[i]);

        if ((D + d) >= I) {
          const qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
          const qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
          const q = new Point(qx, qy, points[i].ID);

          newpoints[newpoints.length] = q; // append new point 'q'
          // insert 'q' at position i in points s.t. 'q' will be the next i
          points.splice(i, 0, q);
          D = 0.0;
        } else D += d;
      }
    }
    // sometimes we fall a rounding-error short of adding the last point, so add it if so
    if (newpoints.length == n - 1) {
      newpoints[newpoints.length] = new Point(
        points[points.length - 1].X,
        points[points.length - 1].Y,
        points[points.length - 1].ID);
    }
    return newpoints;
  }

  function scale(points) {
    const newpoints = [];
    let minX, minY, maxX, maxY;
    minX = minY = +Infinity;
    maxX = maxY = -Infinity;

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

  function centroid(points) {
    let x = 0.0;
    let y = 0.0;

    for (let i = 0; i < points.length; i++) {
      x += points[i].X;
      y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;

    return new Point(x, y, 0);
  }

  function pathLength(points) { // length traversed by a point path
    let d = 0.0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].ID == points[i - 1].ID) {
        d += distance(points[i - 1], points[i]);
      }
    }
    return d;
  }

  function distance(p1, p2) { // Euclidean distance between two points
    const dx = p2.X - p1.X;
    const dy = p2.Y - p1.Y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ================ PUBLIC ====================

  const PDollar = Object.freeze({
    initDefaultGestures: initDefaultGestures,
    Point: Point,
    Recognizer: Recognizer,
  });

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PDollar;
  } else if (typeof define === 'function' && define.amd) {
    define('pdollar', function () {
      return PDollar;
    });
  } else {
    window.PDollar = PDollar;
  }
}());
