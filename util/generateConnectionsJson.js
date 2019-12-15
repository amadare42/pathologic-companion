const  parse = require("csv-parse");
const fs = require("fs");
const { resolve } = require("path");


(async () => {
    const parser = parse({ delimiter: ";", columns: true, cast: true });
    fs.createReadStream(resolve(`${__dirname}/../data/connections.csv`))
        .pipe(parser);
    let result = [];
    for await (const record of parser) {
        result.push({ ...record, connections: record.connections.split(",").map(i => parseInt(i))});
    }
    fs.writeFileSync(resolve(`${__dirname}/../src/data/connections.json`), JSON.stringify(result, null, 2));
    console.log("ok");
})();
