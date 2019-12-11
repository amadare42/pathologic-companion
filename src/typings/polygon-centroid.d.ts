declare module "polygon-centroid" {
    interface Point {
        x: number, y: number
    }
    export = (points: Point[]) => Point;
}
