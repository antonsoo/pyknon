import { VINA_DEFAULT, type VinaState, vinaMatches, vinaModel } from "../src/core/vina";

const preparations: Pick<VinaState, "tuning" | "tenth">[] = [
  ...Array.from({ length: 701 }, (_, tenth) => ({ tuning: "free" as const, tenth })),
  ...(["comma", "quarter", "boundary", "zero"] as const).map((tuning) => ({ tuning, tenth: 215 })),
];
for (const preparation of preparations)
  for (const root of [110, 220] as const)
    for (const position of [
      0, 1, 999, 1000, 1001, 1999, 2000, 2001, 2999, 3000, 3001, 3999, 4000,
    ]) {
      const state = { ...VINA_DEFAULT, ...preparation, root, position };
      process.stdout.write(
        `${JSON.stringify({ state, model: vinaModel(state), matches: vinaMatches(state) })}\n`,
      );
    }
