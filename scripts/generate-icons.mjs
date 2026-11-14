// Renders the app icon, Android adaptive layers and the splash mark from one
// SVG source so they never drift. Run with `bun run icons` after editing.
// The iOS 26 icon (assets/liner.icon) uses the same record SVG as its layer.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const ACCENT = "#F2542D";
const VINYL = "#141414";
const GROOVE = "#2B2B2B";

/** A vinyl record on a transparent 1024 canvas, `scale` of the full width. */
function recordSvg({ scale = 0.74, vinyl = VINYL, groove = GROOVE, label = ACCENT, hole = VINYL } = {}) {
  const r = 512 * scale;
  const grooves = [0.9, 0.8, 0.7, 0.6]
    .map((f) => `<circle cx="512" cy="512" r="${r * f}" fill="none" stroke="${groove}" stroke-width="${r * 0.014}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="${r}" fill="${vinyl}"/>
  ${grooves}
  <circle cx="512" cy="512" r="${r * 0.36}" fill="${label}"/>
  <circle cx="512" cy="512" r="${r * 0.05}" fill="${hole}"/>
</svg>`;
}

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

async function main() {
  await mkdir("assets/images", { recursive: true });
  await mkdir("assets/liner.icon/Assets", { recursive: true });

  // Legacy/full-bleed icon: record on the accent background.
  const flat = recordSvg().replace("<circle", `<rect width="1024" height="1024" fill="${ACCENT}"/><circle`);
  await writeFile("assets/images/icon.png", await png(flat, 1024));

  // Android adaptive icon: the foreground must sit inside the 66% safe zone.
  await writeFile("assets/images/android-icon-foreground.png", await png(recordSvg({ scale: 0.5 }), 1024));
  // Themed (monochrome) icon: Android tints the alpha mask, so draw the disc
  // solid and punch the grooves and label out as transparent rings.
  const mono = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><mask id="m"><rect width="1024" height="1024" fill="white"/>
  <circle cx="512" cy="512" r="${256 * 0.36}" fill="black"/>
  <circle cx="512" cy="512" r="${256 * 0.36 * 0.6}" fill="white"/>
  <circle cx="512" cy="512" r="${256 * 0.05}" fill="black"/></mask></defs>
  <circle cx="512" cy="512" r="256" fill="white" mask="url(#m)"/>
</svg>`;
  await writeFile("assets/images/android-icon-monochrome.png", await png(mono, 1024));

  // Splash mark: the record alone, cropped tight.
  await writeFile("assets/images/splash-icon.png", await png(recordSvg({ scale: 1 }), 512));

  // iOS 26 Icon Composer bundle: accent fill + record layer.
  await writeFile("assets/liner.icon/Assets/record.svg", recordSvg());
  const iconJson = {
    fill: { "automatic-gradient": "extended-srgb:0.94902,0.32941,0.17647,1.00000" },
    groups: [
      {
        layers: [{ "image-name": "record.svg", name: "record" }],
        shadow: { kind: "neutral", opacity: 0.5 },
        translucency: { enabled: true, value: 0.4 },
      },
    ],
    "supported-platforms": { circles: ["watchOS"], squares: "shared" },
  };
  await writeFile("assets/liner.icon/icon.json", JSON.stringify(iconJson, null, 2) + "\n");
  console.log("icons written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
