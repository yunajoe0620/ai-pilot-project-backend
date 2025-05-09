Manipulate[
  Graphics3D[
    {Red, Sphere[]},
    ViewPoint -> {Cos[theta], Sin[theta], 1.5},
    Boxed -> False,
    ImageSize -> 300
  ],
  {theta, 0, 2 Pi}
]