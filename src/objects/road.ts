import Border from "./border";
import Coordinate from "./coordinate";

export default class Road {
    // adjustable
    private readonly borderColor = "yellow";
    private readonly borderWidth = 5;
    private readonly laneBorderColor = "white";
    private readonly laneBorderWidth = 2;
    private readonly laneBorderDashes = [20,20];

    private left : number;
    private top : number;
    private width : number;
    private height : number;
    private lanes : number;
    
    public laneWidth : number;
    public borders : Border[] = [];

    constructor(
        xCenter : number, yCenter : number, width : number,
        height : number, lanes : number) 
    {
        this.left = xCenter - width / 2;
        this.top = yCenter - height / 2;
        this.width = width;
        this.height = height;
        this.lanes = lanes;

        let leftBorder = new Border(
            new Coordinate(this.left, - this.height/2),
            new Coordinate(this.left, this.height/2)
        );
        let rightBorder = new Border(
            new Coordinate(this.left + this.width, - this.height/2),
            new Coordinate(this.left + this.width, this.height/2)
        );
        this.borders.push(leftBorder);
        this.borders.push(rightBorder);

        this.laneWidth = this.width / (this.lanes);
    }

    /**
     * Draws road.
     * 
     * @param ctx 2d context of canvas
     */
    draw(ctx : CanvasRenderingContext2D) : void {
        ctx.lineWidth = this.laneBorderWidth;
        ctx.strokeStyle = this.laneBorderColor;
        ctx.setLineDash(this.laneBorderDashes);

        for (let i = 1; i < this.lanes; i++) {
            const x = this.left + i * this.width / this.lanes;

            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.top + this.height);
            ctx.stroke();
        }        

        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColor;

        for (let border of this.borders) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(border.from.x,border.from.y);
            ctx.lineTo(border.to.x,border.to.y);
            ctx.stroke();
        }
    } 

    /**
     * Lanes numbered from 1 - laneCount
     * @param lane 
     * @returns x val corresponding to center of lane
     */
    getLaneXval(lane : number) : number {
        lane = Math.min(this.lanes,Math.max(1,lane));

        return this.left + this.laneWidth / 2 + this.laneWidth *
            (lane - 1);
    }
}