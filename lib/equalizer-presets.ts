export type EqualizerPreset =
  | "flat"
  | "bass"
  | "treble"
  | "vocal"
  | "rock"
  | "pop"
  | "jazz"
  | "classical"
  | "electronic"
  | "late-night";

export const EQUALIZER_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000];

export const EQUALIZER_PRESETS: Record<EqualizerPreset, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0],
  bass: [6, 5, 3, 1, 0, -1, -2, -2],
  treble: [-2, -1, 0, 1, 2, 4, 5, 6],
  vocal: [-2, -1, 1, 3, 4, 3, 1, -1],
  rock: [4, 3, -1, -2, 1, 3, 4, 4],
  pop: [-1, 2, 4, 3, 1, -1, 2, 3],
  jazz: [2, 1, 0, 2, 3, 2, 1, 3],
  classical: [1, 2, 2, 1, -1, 0, 2, 3],
  electronic: [5, 4, 1, 0, -1, 2, 4, 5],
  "late-night": [-4, -3, -2, -1, 0, 1, 0, -1],
};

export const EQUALIZER_OPTIONS: Array<{
  label: string;
  value: EqualizerPreset;
}> = [
  { label: "Flat", value: "flat" },
  { label: "Bass Boost", value: "bass" },
  { label: "Treble Boost", value: "treble" },
  { label: "Vocal", value: "vocal" },
  { label: "Rock", value: "rock" },
  { label: "Pop", value: "pop" },
  { label: "Jazz", value: "jazz" },
  { label: "Classical", value: "classical" },
  { label: "Electronic", value: "electronic" },
  { label: "Late Night", value: "late-night" },
];
