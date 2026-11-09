export interface ProgressRingProps {
  value: number;
  total: number;
  /** Short text in the middle of the ring, e.g. "24%". */
  label: string;
  color: string;
  size?: number;
}
