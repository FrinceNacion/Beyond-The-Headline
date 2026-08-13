// One-time migration tool: bakes the legacy hand-authored pixel grids into real
// PNG image assets + a centralized asset registry.
//
//   node --experimental-strip-types scripts/gen-sprites.mjs
//
// After this runs the game renders from PNGs (assets/<category>/<name>.png) via
// the registry, and the ASCII grid modules are no longer needed. Designers can
// edit or replace any sprite by dropping a new PNG in place — no code changes to
// the pixel data. Re-running this script is only for regenerating from the old
// grids and is not required for normal asset editing.

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const GAME = resolve(ROOT, "src/app/game");
const OUT = resolve(ROOT, "src/assets");

/* ----------------------------------------------------------- load grid data */

const { SPR, SPRITE_COLORS } = await import(resolve(GAME, "sprites.ts"));
const { TOWN, TOWN_COLORS } = await import(resolve(GAME, "sprites-town.ts"));
const { STORY, STORY_COLORS } = await import(resolve(GAME, "sprites-story.ts"));
const { MIL, MIL_COLORS } = await import(resolve(GAME, "sprites-mil.ts"));
const { ARCADE, ARCADE_COLORS } = await import(resolve(GAME, "sprites-arcade.ts"));

// Merge order matches the legacy renderer (later maps win on duplicate names).
const SOURCES = [
  ["core", SPR],
  ["town", TOWN],
  ["story", STORY],
  ["mil", MIL],
  ["arcade", ARCADE],
];
const LEGEND = {
  ...SPRITE_COLORS,
  ...TOWN_COLORS,
  ...STORY_COLORS,
  ...MIL_COLORS,
  ...ARCADE_COLORS,
};

// Semantic folder each sprite lands in (task-requested layout). Default: objects.
const CATEGORY = {
  editor: "characters", bust1: "characters", bust2: "characters", people: "characters",
  rumor1: "characters", rumor2: "characters", rumorIcon: "characters",
  npcA1: "characters", npcA2: "characters", npcA3: "characters", npcA4: "characters",
  npcB1: "characters", npcB2: "characters", npcB3: "characters", npcB4: "characters",
  npcC1: "characters", npcC2: "characters",
  bakery: "locations", cityhall: "locations", market: "locations", newsoffice: "locations",
  police: "locations", school: "locations", postoffice: "locations", library: "locations",
  house1: "locations", house2: "locations", house3: "locations",
  tree1: "locations", tree2: "locations", tree3: "locations", hedge: "locations",
  lamppostOn: "locations", lamppostOff: "locations", bench: "locations", fountain: "locations",
  bicycle: "locations", mailbox: "locations", busstop: "locations", birdwire: "locations",
  noticeboard: "locations", news1: "locations", news2: "locations", news3: "locations", news4: "locations",
  check: "ui", cross: "ui", flag: "ui", badge: "ui", arrowR: "ui", starOn: "ui", starOff: "ui",
  siftStop: "ui", siftSource: "ui", siftCoverage: "ui", siftTrace: "ui",
  compSource: "ui", compBias: "ui", compChain: "ui", compCompare: "ui", compGenre: "ui",
  gauge: "ui", chart: "ui", handbook: "ui", export: "ui", keyboard: "ui", eye: "ui", shield: "ui", globe: "ui",
  flagEN: "ui", flagES: "ui", flagFR: "ui", flagZH: "ui", flagAR: "ui",
  logoLedger: "ui", logoSocial: "ui", logoSeal: "ui",
};
const categoryOf = (name) => CATEGORY[name] ?? "objects";

// Pre-baked recolor variants. The legacy `recolor` prop was only ever used with
// this one constant mapping (dark windows in unlit houses on the community map).
const RECOLOR_VARIANTS = [{ w: "#2A3138" }];

/* -------------------------------------------------------------- PNG encoder */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
/** rgba: Uint8Array length w*h*4. Returns a Buffer of PNG bytes. */
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // 10,11,12 = compression / filter / interlace = 0
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy
      ? rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
      : Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* -------------------------------------------------------------- rasterizer */

function hexToRGBA(hex) {
  const s = hex.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
    255,
  ];
}
/** Turn a string[] grid into PNG bytes at native (1px per cell) resolution. */
function rasterize(rows, legend) {
  const h = rows.length;
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const rgba = Buffer.alloc(w * h * 4); // zeroed = transparent
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const k = row[x] ?? ".";
      if (k === ".") continue;
      const hex = legend[k];
      if (!hex) {
        console.warn(`  ! missing colour for '${k}' — rendering magenta`);
      }
      const [r, g, b, a] = hexToRGBA(hex ?? "#FF00FF");
      const o = (y * w + x) * 4;
      rgba[o] = r;
      rgba[o + 1] = g;
      rgba[o + 2] = b;
      rgba[o + 3] = a;
    }
    return null;
  });
  return { w, h, png: encodePNG(w, h, rgba) };
}

const recolorSig = (map) =>
  Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(",");

const camel = (s) => s.replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase());

/* ---------------------------------------------------------------- generate */

rmSync(OUT, { recursive: true, force: true });
for (const c of ["characters", "objects", "locations", "ui"]) {
  mkdirSync(resolve(OUT, c), { recursive: true });
}

// name -> { category, file, w, h, variants: {sig: file} }  (last source wins)
const registry = {};

for (const [, map] of SOURCES) {
  for (const [name, rows] of Object.entries(map)) {
    const cat = categoryOf(name);
    const { w, h, png } = rasterize(rows, LEGEND);
    const file = `${cat}/${name}.png`;
    writeFileSync(resolve(OUT, file), png);

    const variants = {};
    for (const rc of RECOLOR_VARIANTS) {
      const keys = Object.keys(rc);
      const usesKey = rows.some((r) => keys.some((k) => r.includes(k)));
      if (!usesKey) continue;
      const sig = recolorSig(rc);
      const vFile = `${cat}/${name}__${sig.replace(/[:#,]/g, "")}.png`;
      const { png: vPng } = rasterize(rows, { ...LEGEND, ...rc });
      writeFileSync(resolve(OUT, vFile), vPng);
      variants[sig] = vFile;
    }
    registry[name] = { cat, file, w, h, variants };
  }
}

/* ----------------------------------------------------------- emit registry */

const names = Object.keys(registry);
const importName = (name) => `spr_${camel(name)}`;
const varImportName = (name, i) => `spr_${camel(name)}_v${i}`;

const importLines = [];
const entryLines = [];
for (const name of names) {
  const e = registry[name];
  importLines.push(`import ${importName(name)} from "./${e.file}";`);
  const vEntries = Object.entries(e.variants);
  const vImports = [];
  const vFields = [];
  vEntries.forEach(([sig, vfile], i) => {
    const vi = varImportName(name, i);
    importLines.push(`import ${vi} from "./${vfile}";`);
    vFields.push(`${JSON.stringify(sig)}: ${vi}`);
  });
  const variantsField = vFields.length ? `, variants: { ${vFields.join(", ")} }` : "";
  entryLines.push(
    `  ${JSON.stringify(name)}: { src: ${importName(name)}, w: ${e.w}, h: ${e.h}${variantsField} },`,
  );
}

// Semantic ASSETS tree grouped by category.
const byCat = { characters: [], objects: [], locations: [], ui: [] };
for (const name of names) byCat[registry[name].cat].push(name);
const catLines = Object.entries(byCat)
  .map(([cat, ns]) => {
    const inner = ns.map((n) => `    ${JSON.stringify(camel(n))}: ${importName(n)},`).join("\n");
    return `  ${cat}: {\n${inner}\n  },`;
  })
  .join("\n");

const out = `// AUTO-GENERATED by scripts/gen-sprites.mjs — do not edit by hand.
//
// Every pixel-art sprite is a real PNG image under src/assets/<category>/.
// To add or replace a sprite: drop a PNG in the right folder and add one line
// to SPRITE_ASSETS below (plus, optionally, to the ASSETS tree). No pixel data
// lives in TypeScript anymore.

${importLines.join("\n")}

export type SpriteAsset = {
  /** imported PNG url (nearest-neighbour scaled at render time) */
  src: string;
  /** native pixel width / height (one grid cell = one pixel) */
  w: number;
  h: number;
  /** optional pre-baked colour variants, keyed by recolor signature */
  variants?: Record<string, string>;
};

/** Flat, name-keyed lookup used by <PixelSprite name="..." />. */
export const SPRITE_ASSETS: Record<string, SpriteAsset> = {
${entryLines.join("\n")}
};

/**
 * Semantic asset tree. Reference assets by meaning, e.g.
 *   ASSETS.objects.coin
 *   ASSETS.characters.editor
 *
 * Characters can hold multiple expressions/variations without duplicating
 * logic. Drop the images in assets/characters/<name>/ and list them here:
 *
 *   characters: {
 *     margaretOdell: {
 *       neutral, concerned, surprised, suspicious, happy, angry,
 *     },
 *   }
 */
export const ASSETS = {
${catLines}
} as const;
`;

writeFileSync(resolve(OUT, "registry.ts"), out);

const readme = `# Game assets

Pixel-art sprites live here as PNG images, organised by kind:

- \`characters/\` — the editor, busts, NPCs, Rumor
- \`objects/\` — coins, locks, tools, gameplay props
- \`locations/\` — buildings and town scenery
- \`ui/\` — icons, SIFT marks, competency badges, flags, logos

## Editing or replacing a sprite

1. Create / edit the pixel art in any editor.
2. Export a **transparent PNG** at native pixel resolution (1 art pixel = 1 image pixel).
3. Save it over the existing file, or into the matching folder with a new name.
4. If it is a new sprite, add one line to \`registry.ts\` (\`SPRITE_ASSETS\`).
5. Use it: \`<PixelSprite name="yourName" />\`.

Sprites are rendered with nearest-neighbour scaling (\`image-rendering: pixelated\`),
so they stay crisp at any \`scale\`.

## Character expressions

A character can expose several images (expressions/poses). Group them under
\`characters/<character>/\` and list them in \`ASSETS.characters\`, e.g.
\`ASSETS.characters.margaretOdell.concerned\`.

> \`registry.ts\` is auto-generated by \`scripts/gen-sprites.mjs\` for the initial
> migration, but you can hand-edit it freely afterwards — it is normal source.
`;
writeFileSync(resolve(OUT, "README.md"), readme);

console.log(`Wrote ${names.length} sprites + variants to src/assets/, plus registry.ts`);
