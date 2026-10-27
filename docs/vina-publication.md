# Two-vina publication, 2026-10-26

**[Same matches. Different pitches.](https://antonsoo.github.io/pyknon/vina.html?tuning=comma&tenth=215&position=2000&root=220&selected=2&sound=pair&reading=3&page=29#vn-bench)**
is public. The Sanskrit matching argument, modern model, source pages and
portable reading have their own [direct review](vina-review.md).

| Boundary                                              | Recorded identity and result                                                                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime source                                        | `ba3d833073678404a7e032cd61f96eaaa65755ab`                                                                                                                            |
| Reviewed source, examples and evidence pushed to main | `624cb6a79ae18c8547c6888687eb139a136fecd5`                                                                                                                            |
| Static publication                                    | `0bd4b0e3e3bdfc435ab400fa9ff5a28dbb4ff29f`, normal fast-forward overlay of the existing `gh-pages` branch; older hashed assets retained                               |
| Complete edition                                      | `2ae29ce5c27911982b1a712d4a202c3825c6d49c33bcc6200027d2709a96193c`                                                                                                    |
| Fresh public installation                             | New HTTPS clone of `624cb6a`, fresh `npm ci`, Node 24.21.0, `npm run check` passes; all 78 output paths and bytes equal the reviewed Node 26.7.0 build                |
| Canonical public files                                | All 78 current files and root/index aliases match before and after the complete public browser review                                                                 |
| Public browser journey                                | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 px; controls, source readings, actual downloads, real audio and browser-offline use of all seven rooms |

[Public-clone identity](vina-review/public-build.json) ·
[Canonical files before](vina-review/hosted-before.json) ·
[Canonical files after](vina-review/hosted-after.json) ·
[Public browser receipt](vina-review/public-browser.json).

The actual public controls supplied 52 comparison samples, 364 CSV rows and
728 rendered SVG groups to the independent ratio-chain oracle. All public CSV
bytes equal the [retained per-browser CSVs](vina-review/).
Every source page was identified from the displayed blob's SHA-256. Saved
HTML/SVG opened with scripts disabled; embedded sound actually played without
HTTP rendering requests. The matching controller and complete 77-resource
cache preceded offline readiness. Browser networking was then disabled, all
seven rooms reloaded, and an independent illustrated reading saved.
The public origin remained available; the local review separately refused
origin requests and exercised delayed, substituted and upgraded editions.

[Public geometry](vina-review/public-geometry.json) ·
[Public portable files and 15-page PDF](vina-review/public-artifacts.json).

The independent audio oracle measured all **16 actual public WAV downloads**.
Maximum observed frequency error was **0.006493 cents**, rounded up; full-PCM
fit RMS outside the separately bounded automation-edge windows was at most
**0.00001163**, rounded up. These reproduce the local numerical limits;
they do not measure speakers, perception or historical instruments.
[Public audio receipt](vina-review/public-audio.json).

```sh
node scripts/vina-browser.mjs /tmp/pyknon-vina-public https://antonsoo.github.io/pyknon/
python3 scripts/vina-oracle.py --browser /tmp/pyknon-vina-public/review.json
python3 scripts/vina-artifacts.py /tmp/pyknon-vina-public
uv run --python 3.12 --with numpy==2.4.4 python3 scripts/vina-wave-oracle.py /tmp/pyknon-vina-public/review.json
```

GitHub's source [CI run](https://github.com/antonsoo/pyknon/actions/runs/40442131989)
and source [Pages workflow](https://github.com/antonsoo/pyknon/actions/runs/40442131926)
did not start any job steps: the check annotations report an account billing
lock. The separate legacy [Pages build and deployment](https://github.com/antonsoo/pyknon/actions/runs/40442158853)
for the static commit succeeded. The Pages API identified `gh-pages` as its
actual source. [Workflow evidence](vina-review/workflows.json).
No successful source CI, registry release, tagged-PDF accessibility or physical
printing is claimed. Cents, exact modern consonances and synthetic sine tones
remain an explicitly attributed instructional interpretation.
