import { render } from './wk'

// const a = parse_wk(`wk --wk:debug lol --wk:caller run --wk:verbose`)
const a = render(`wk --wk debug --wk:caller run --wk verbose --wk commands=commands.yml --wk:lol=false xrun --plouf yolo`)
console.log(a);
