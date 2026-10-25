import {
  type TensionSound,
  tensionDefault,
  tensionPlan,
  tensionRows,
  weight,
} from "../src/core/tension";
import { at } from "../src/core/tetrachord";

let seed = 739;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const cases = [
  "6",
  "8",
  "9",
  "12",
  "24",
  "30",
  "32/3",
  "27/2",
  "6.0001",
  "29.9999",
  ...Array.from({ length: 240 }, () => (6 + Math.round(random() * 240000) / 10000).toFixed(4)),
];
for (let i = 0; i < cases.length; i++) {
  const s = tensionDefault();
  s.root = i % 2 ? 110 : 220;
  s.selected = ((i % 3) + 1) as 1 | 2 | 3;
  s.weights[1] = weight(at(cases, i));
  s.weights[2] = weight(at(cases, (i + 7) % cases.length));
  s.weights[3] = weight(at(cases, (i + 13) % cases.length));
  console.log(
    JSON.stringify({
      state: s,
      rows: tensionRows(s),
      plans: Object.fromEntries(
        (["claim", "original", "yours", "compare", "together"] as TensionSound[]).map((k) => [
          k,
          tensionPlan(s, k),
        ]),
      ),
    }),
  );
}
