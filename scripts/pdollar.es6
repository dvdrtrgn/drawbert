// http://depts.washington.edu/madlab/proj/dollar/pdollar.html
(function () {

  // defaults (globals/constants)
  const DEF = {
    numPoints: 33, // lower...fewer
    origin: new Point(0, 0, 0),
  };

  // ================ CLASSES ====================

  function Point(x, y, id) {
    this.X = x;
    this.Y = y;
    this.ID = id; // stroke ID to which this point belongs (1,2,...)
  }

  function PointCloud(name, points) { // template
    this.name = name;
    this.points = points.concat(); // protect passed array
    this.points = resample(this.points, DEF.numPoints);
    this.points = scale(this.points);
    this.points = translateTo(this.points, DEF.origin);
  }

  function Result(name, score) {
    this.name = name;
    this.score = score;
  }

  // The $P Point-Cloud Recognizer API begins here
  // 3 methods:
  //    recognize()
  //    addGesture()
  //    deleteUserGestures()
  function Recognizer(numPoints, origin) {
    if (typeof numPoints !== 'undefined') {
      DEF.numPoints = numPoints;
    }
    if (typeof origin !== 'undefined') {
      DEF.origin = origin;
    }
    this.clouds = [];

    this.recognize = function (points) {
      let [best, idx] = [+Infinity, -1];
      points = resample(points, DEF.numPoints);
      points = scale(points);
      points = translateTo(points, DEF.origin);

      for (let i = 0; i < this.clouds.length; i++) { // for each point-cloud template
        const dist = greedyCloudMatch(points, this.clouds[i]);
        if (dist < best) {
          best = dist; // best (least) distance
          idx = i; // point-cloud
        }
      }
      return (idx === -1) ?
        new Result('No match.', 0) :
        new Result(this.clouds[idx].name, Math.max((best - 2) / -2, 0));
    };

    this.addGesture = function (name, points) {
      let num = 0;

      this.clouds[this.clouds.length] = new PointCloud(name, points);

      for (let i = 0; i < this.clouds.length; i++) {
        if (this.clouds[i].name === name) {
          num++;
        }
      }
      return num;
    };

    this.deleteUserGestures = function () {
      return this.clouds.length = 0; // clear any beyond the original set
    };
  }

  // ================ PRIVATE ====================

  function greedyCloudMatch(points, P) {
    const e = 0.5;
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

  function resample(points, n) {
    const I = pathLength(points) / (n - 1); // interval length
    const newpoints = new Array(points[0]);
    let D = 0;

    for (let i = 1; i < points.length; i++) {
      if (points[i].ID === points[i - 1].ID) {
        const d = distance(points[i - 1], points[i]);

        if ((D + d) >= I) {
          const qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
          const qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
          const q = new Point(qx, qy, points[i].ID);

          newpoints[newpoints.length] = q; // append new point 'q'
          // insert 'q' at position i in points s.t. 'q' will be the next i
          points.splice(i, 0, q);
          D = 0;
        } else D += d;
      }
    }
    // sometimes we fall a rounding-error short of adding the last point, so add it if so
    if (newpoints.length === n - 1) {
      newpoints[newpoints.length] = new Point(
        points[points.length - 1].X,
        points[points.length - 1].Y,
        points[points.length - 1].ID);
    }
    return newpoints;
  }

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
    let [x, y] = [0, 0];

    for (let i = 0; i < points.length; i++) {
      x += points[i].X;
      y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;

    return new Point(x, y, 0);
  }

  function pathLength(points) { // length traversed by a point path
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].ID === points[i - 1].ID) {
        d += distance(points[i - 1], points[i]);
      }
    }
    return d;
  }

  function distance(p1, p2) { // Euclidean distance between two points
    const [dx, dy] = [p2.X - p1.X, p2.Y - p1.Y];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ================ PUBLIC ====================

  const PDollar = Object.freeze({
    Point: Point,
    Recognizer: Recognizer,
  });

  if (typeof define === 'function' && define.amd) {
    define('pdollar', PDollar);
  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PDollar;
  } else {
    window.PDollar = PDollar;
  }
}());
