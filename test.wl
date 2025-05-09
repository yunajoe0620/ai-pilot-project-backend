Export["cube_diagonals.png",
 Block[{s, coordA, coordB, coordC, coordD, coordE, coordF, coordG, coordH, vecAC, vecFH, cosTheta},
  s = 2;
  coordE = {0, 0, 0}; coordF = {s, 0, 0}; coordG = {s, s, 0}; coordH = {0, s, 0};
  coordA = {0, 0, s}; coordB = {s, 0, s}; coordC = {s, s, s}; coordD = {0, s, s};

  vecAC = coordC - coordA;
  vecFH = coordH - coordF;
  cosTheta = Abs[vecAC . vecFH]/(Norm[vecAC] * Norm[vecFH]);

  Graphics3D[{
    {Opacity[0.15], Gray, EdgeForm[{Thin, Black}], Cuboid[coordE, coordC]},
    {Blue, Thickness[0.008], Line[{coordA, coordC}]},
    {Red, Thickness[0.008], Line[{coordF, coordH}]},
    {PointSize[Medium], Black, Point[coordA], Point[coordC], Point[coordF], Point[coordH]},
    Text[Style["A", 12, Bold], coordA, {-1.5, -1.5, 0}],
    Text[Style["C", 12, Bold], coordC, {1.5, 1.5, 0}],
    Text[Style["F", 12, Bold], coordF, {1.5, -1.5, 0}],
    Text[Style["H", 12, Bold], coordH, {-1.5, 1.5, 0}],
    Text[Style["AC ⟂ FH (cos θ = 0)", 12, Bold], {s/2, s/2, -s*0.2}]
  },
  Axes -> True,
  AxesLabel -> {"x", "y", "z"},
  Boxed -> True,
  ImageSize -> Medium,
  ViewPoint -> {2, -2, 1.5}
  ]
 ]]
