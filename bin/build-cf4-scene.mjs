#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
import { sceneFromMobile } from "../lib/cf4-scene.mjs";
const input=process.argv[2] ?? "data/cf4/mobile.json";
const output=process.argv[3] ?? "data/cf4/scene-mobile.json";
const scene=sceneFromMobile(JSON.parse(fs.readFileSync(input,"utf8")));
fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,JSON.stringify(scene));
console.log(`CF4 scene: ${scene.layers[0].count} points, ${scene.layers[1].count} lines -> ${output}`);
