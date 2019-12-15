const SVGPathInterpolator = require('svg-path-interpolator');
const fs = require('fs');
const path = require('path');
const centroid = require('polygon-centroid');

const config = {
    joinPathData: false,
    minDistance: 0.1,
    roundToNearest: 1,
    sampleFrequency: 0.000001
};
const interpolator = new SVGPathInterpolator(config);

let centroids = {};
const polyRoot = '../src/images/polygons';
for (let fileName of fs.readdirSync(polyRoot)) {
    const filePath = path.resolve(polyRoot, fileName);
    const name = path.parse(fileName).name;
    const content = fs.readFileSync(filePath).toString();

    process.stdout.write("processing: " + name + ": interpolating polygon\r");
    const polygon = interpolator.processSvg(content);
    const poly = polygon[Object.keys(polygon)[0]];

    const points = [];
    for (let i = 0; i < poly.length; i+=2) {
        const point = {
            x: Math.floor(poly[i] / 4),
            y: Math.floor(poly[i+1] / 4)
        };
        points.push(point);
    }
    process.stdout.write("processing: " + name + ": calculating centroid...\r");
    const center = centroid(points);
    process.stdout.clearLine();
    console.log(name, center, '\r');
}

console.log(centroid([{ 'x': 188, "y": 893 }, { 'x': 141, 'y': 857 }, { 'x': 71, 'y': 768 }, {'x': 52,'y': 727}, { 'x': 38, 'y': 670 }, { 'x': 107, 'y': 625 }, { 'x': 164, 'y': 569 }, { 'x': 271, 'y': 467 }, {'x': 350,'y': 391}, { 'x': 446, 'y': 298 }, { 'x': 515, 'y': 251 }, { 'x': 574, 'y': 224 }, { 'x': 617, 'y': 205 }, {'x': 685,'y': 182}, { 'x': 686, 'y': 210 }, { 'x': 645, 'y': 310 }, { 'x': 617, 'y': 403 }, { 'x': 608, 'y': 483 }, {'x': 608,'y': 584}, { 'x': 619, 'y': 676 }, { 'x': 528, 'y': 687 }, { 'x': 455, 'y': 706 }, { 'x': 365, 'y': 756 }, {'x': 236,'y': 847}]));

