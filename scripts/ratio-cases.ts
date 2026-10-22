import { GENERA, notes, plan, type State } from "../src/core/tetrachord";

for (const genus of GENERA) {
  for (const root of [110, 220, 440] as const) {
    for (const direction of ["up", "down"] as const) {
      const state: State = { genus: genus.id, root, direction };
      console.log(JSON.stringify({ state, notes: notes(state), plan: plan(state, "compare") }));
    }
  }
}
