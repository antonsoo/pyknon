import {
  CANON_DEFAULT,
  CANON_SOUNDS,
  canonComparison,
  canonPlan,
  canonSteps,
} from "../src/core/canon";

console.log(
  JSON.stringify(
    [110, 220, 440].map((root) => ({
      root,
      steps: canonSteps(root as 110 | 220 | 440),
      comparison: canonComparison(root as 110 | 220 | 440),
      plans: Array.from({ length: 7 }, (_, step) =>
        CANON_SOUNDS.map((sound) => ({
          step,
          sound,
          ...canonPlan({ ...CANON_DEFAULT, root: root as 110 | 220 | 440, step, sound }),
        })),
      ).flat(),
    })),
  ),
);
