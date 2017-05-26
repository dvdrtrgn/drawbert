(function () {
  // globals constants
  // http://depts.washington.edu/madlab/proj/dollar/pdollar.html
  var NumPoints = 32;
  var Origin = new Point(0, 0, 0);

  // ================ CLASSES ====================

  function Point(x, y, id) {
    this.X = x;
    this.Y = y;
    this.ID = id; // stroke ID to which this point belongs (1,2,...)
  }

  function PointCloud(name, points) { // template
    this.Name = name;
    this.Points = resample(points, NumPoints);
    this.Points = scale(this.Points);
    this.Points = translateTo(this.Points, Origin);
  }

  function Result(name, score) {
    this.Name = name;
    this.Score = score;
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

      var b = +Infinity;
      var u = -1;
      // for each point-cloud template
      for (var i = 0; i < this.PointClouds.length; i++) {
        var d = greedyCloudMatch(points, this.PointClouds[i]);
        if (d < b) {
          b = d; // best (least) distance
          u = i; // point-cloud
        }
      }
      return (u == -1) ?
        new Result('No match.', 0.0) :
        new Result(this.PointClouds[u].Name, Math.max((b - 2.0) / -2.0, 0.0));
    };

    this.addGesture = function (name, points) {
      this.PointClouds[this.PointClouds.length] = new PointCloud(name, points);
      var num = 0;
      for (var i = 0; i < this.PointClouds.length; i++) {
        if (this.PointClouds[i].Name == name)
          num++;
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
    var e = 0.50;
    var step = Math.floor(Math.pow(points.length, 1 - e));
    var min = +Infinity;

    for (var i = 0; i < points.length; i += step) {
      var d1 = cloudDistance(points, P.Points, i);
      var d2 = cloudDistance(P.Points, points, i);
      min = Math.min(min, Math.min(d1, d2)); // min3
    }
    return min;
  }

  function cloudDistance(pts1, pts2, start) {
    var matched = new Array(pts1.length); // pts1.length == pts2.length

    for (var k = 0; k < pts1.length; k++) {
      matched[k] = false;
    }
    var sum = 0;
    var i = start;

    do {
      var index = -1;
      var min = +Infinity;

      for (var j = 0; j < matched.length; j++) {
        if (!matched[j]) {
          var d = distance(pts1[i], pts2[j]);
          if (d < min) {
            min = d;
            index = j;
          }
        }
      }
      matched[index] = true;
      var weight = 1 - ((i - start + pts1.length) % pts1.length) / pts1.length;
      sum += weight * min;
      i = (i + 1) % pts1.length;
    } while (i != start);
    return sum;
  }

  function resample(points, n) {
    var I = pathLength(points) / (n - 1); // interval length
    var D = 0.0;
    var newpoints = new Array(points[0]);

    for (var i = 1; i < points.length; i++) {
      if (points[i].ID == points[i - 1].ID) {
        var d = distance(points[i - 1], points[i]);

        if ((D + d) >= I) {
          var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
          var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
          var q = new Point(qx, qy, points[i].ID);

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
    var minX = +Infinity,
      maxX = -Infinity,
      minY = +Infinity,
      maxY = -Infinity,
      i;
    for (i = 0; i < points.length; i++) {
      minX = Math.min(minX, points[i].X);
      minY = Math.min(minY, points[i].Y);
      maxX = Math.max(maxX, points[i].X);
      maxY = Math.max(maxY, points[i].Y);
    }
    var size = Math.max(maxX - minX, maxY - minY);
    var newpoints = [];
    for (i = 0; i < points.length; i++) {
      var qx = (points[i].X - minX) / size;
      var qy = (points[i].Y - minY) / size;
      newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
    }
    return newpoints;
  }

  function translateTo(points, pt) { // translates points' centroid
    var c = centroid(points);
    var newpoints = [];
    for (var i = 0; i < points.length; i++) {
      var qx = points[i].X + pt.X - c.X;
      var qy = points[i].Y + pt.Y - c.Y;
      newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
    }
    return newpoints;
  }

  function centroid(points) {
    var x = 0.0,
      y = 0.0;
    for (var i = 0; i < points.length; i++) {
      x += points[i].X;
      y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;
    return new Point(x, y, 0);
  }

  function pathLength(points) { // length traversed by a point path
    var d = 0.0;
    for (var i = 1; i < points.length; i++) {
      if (points[i].ID == points[i - 1].ID)
        d += distance(points[i - 1], points[i]);
    }
    return d;
  }

  function distance(p1, p2) { // Euclidean distance between two points
    var dx = p2.X - p1.X;
    var dy = p2.Y - p1.Y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ================ PUBLIC ====================

  var PDollar = {
    initDefaultGestures: initDefaultGestures,
    Point: Point,
    Recognizer: Recognizer,
  };

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
