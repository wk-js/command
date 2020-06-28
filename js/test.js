"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wk_1 = require("./wk");
// const a = parse_wk(`wk --wk:debug lol --wk:caller run --wk:verbose`)
// const a = render(`wk --wk debug --wk:caller run --wk verbose --wk commands=commands.yml --wk:lol=false xrun --plouf yolo`)
// const a = parse(`wk --wk debug,verbose,commands=commands.yml --var caller=run --var lol xrun --plouf yolo`)
const a = wk_1.parse(`wk --wk.debug --wk.verbose --wk.commands=commands.yml --var.caller=run --var.lol=false xrun --plouf yolo`);
console.log(a);
