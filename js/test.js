"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wk_1 = require("./wk");
// const a = parse_wk(`wk --wk:debug lol --wk:caller run --wk:verbose`)
const a = wk_1.render(`wk --wk debug --wk:caller run --wk verbose --wk commands=commands.yml --wk:lol=false xrun --plouf yolo`);
console.log(a);
