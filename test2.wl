CloudDeploy[
 DynamicModule[{pos = {0, 0, 0}, start = None},
  EventHandler[
   Dynamic[
    Graphics3D[{Red, Sphere[pos, 1]}, 
     Axes -> True, Boxed -> False, PlotRange -> 10]
   ],
   {
    "MouseDown" :> (start = CurrentValue["MousePosition", "Graphics3D"]),
    "MouseDragged" :> (
      Module[{cur = CurrentValue["MousePosition", "Graphics3D"]},
       If[VectorQ[start] && VectorQ[cur],
        pos = pos + 0.2*(cur - start);
        start = cur;
       ]
      ]
     ),
    "MouseUp" :> (start = None)
   }
  ]
 ],
 Permissions -> "Public"
]
