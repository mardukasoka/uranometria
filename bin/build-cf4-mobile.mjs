#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { buildMobileManifest } from "../lib/cf4-mobile.mjs";

const root=process.argv[2] ?? "data/cf4";
const out=process.argv[3] ?? "data/cf4/mobile.json";
const galaxies=JSON.parse(fs.readFileSync(path.join(root,"galaxies.json"),"utf8"));
const streamlines=JSON.parse(fs.readFileSync(path.join(root,"streamlines.json"),"utf8"));
const packed=buildMobileManifest({galaxies,streamlines});
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(packed));
console.log(`mobile CF4: ${packed.counts.galaxies} galaxies, ${packed.counts.streamlines} streamlines -> ${out}`);
