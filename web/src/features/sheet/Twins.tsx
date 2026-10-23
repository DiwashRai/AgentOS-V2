// The twins: Linear's reference screens drawn with the kit, the same content at the same size, so a
// blind judge comparing a twin with its reference sees the kit's craft and nothing else (the
// restyle's craft contest). Each twin is a file in twins/ exporting `Twin`, beside a JSON file the
// camera reads (the reference, its crop, the scale and theme). Served in development only, and not
// a screen: the kit's reuse count skips the sheet.
import type { ComponentType } from "react";
import { Navigate, useParams } from "react-router";

const TWINS = import.meta.glob<{ Twin: ComponentType }>("./twins/*.tsx", { eager: true });

export function Twins() {
  const twin = TWINS[`./twins/${useParams().name ?? ""}.tsx`];
  return twin ? <twin.Twin /> : <Navigate to="/kit" replace />;
}
