import type { ColorRepresentation, Vector3Tuple } from 'three';

export type R3FColor = ColorRepresentation;
export type R3FVec3 = Vector3Tuple;

export interface Base3DProps {
  color?: R3FColor;
  speed?: number;
  position?: R3FVec3;
}
