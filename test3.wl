s = 2;
coordE = {0, 0, 0}; coordF = {s, 0, 0}; coordG = {s, s, 0}; coordH = {0, s, 0};
coordA = {0, 0, s}; coordB = {s, 0, s}; coordC = {s, s, s}; coordD = {0, s, s};

vecAC = coordC - coordA;
vecFH = coordH - coordF;
cosTheta = Abs[vecAC . vecFH]/(Norm[vecAC] * Norm[vecFH]);

Export["cube_data.json", <|
  "Points" -> <|
    "A" -> coordA, "C" -> coordC, "F" -> coordF, "H" -> coordH
  |>,
  "Lines" -> {
    {"A", "C"}, {"F", "H"}
  },
  "CosTheta" -> cosTheta,
  "CubeSize" -> s
|>, "JSON"]

