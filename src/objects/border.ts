import Coordinate from "./coordinate";

/**
 * Holds coordinates of origin point and destination.
 */
export default class Border {
    public from : Coordinate;
    public to : Coordinate;

    constructor(from : Coordinate, to : Coordinate) {
        this.from = from;
        this.to = to;
    }
}