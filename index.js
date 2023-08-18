const { ComtradeParser } = require("./src/parser");
const fs = require('fs');

const cfg = fs.readFileSync('./data/test3.cfg', 'utf8');
const dat = fs.readFileSync('./data/test3.dat');

try{
    const parser = new ComtradeParser(cfg, dat);
    let data = parser.getPrettyData();
    let parserConfig = parser.config;
    console.log({parserConfig});

    fs.writeFileSync('./out.json', JSON.stringify(data, null, 2));

} catch (err){
    console.error(err.stack);
}
