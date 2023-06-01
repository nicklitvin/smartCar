import Coordinate from "./coordinate";
import Sensor from "./sensor";
import Controls from "./controls";
import Border from "./border";
import NeuralNetwork from "./neuralNetwork";
import Intersect from "./intersection";

/**
 * Car object that can be controlled and moved.
 */
export default class Car {
    // adjustables
    private readonly dummyColor = "red";
    private readonly playerColor = "blue";
    private readonly damagedColor = "black";
    private readonly acceleration = 0.2;
    private readonly zeroSpeedThresh = 0.01;
    private readonly maxDummySpeed = 0;
    private readonly maxPlayerSpeed = 3;
    private readonly friction = 0.97;
    private readonly rotationSpeed = 0.05;
    private readonly distanceForPoint = 1000;
    
    private maxSpeed : number;
    private color : string;
    private isDummy : boolean;
    private corners : Coordinate[] = [];
    private sensor : Sensor | null = null;
    public controls: Controls; // move to private
    private speed = 0;
    private width = 30;
    private height = 50;

    public location: Coordinate; // center of car
    public borders : Border[] = [];
    public brain : NeuralNetwork | null = null;
    public score = 0;
    public angle = 0;
    public damaged = false;
    public carsPassed = 0;

    constructor(
        x: number, y: number, width: number, height: number,
        isDummy = true,
        brain : NeuralNetwork | null = null
    ) {
        this.isDummy = isDummy;
        this.location = new Coordinate(x,y);
        this.controls = new Controls(this.isDummy);
        this.width = width;
        this.height = height;

        if (this.isDummy) {
            this.maxSpeed = this.maxDummySpeed;
            this.color = this.dummyColor;
        } else {
            this.maxSpeed = this.maxPlayerSpeed;
            this.color = this.playerColor;
            this.sensor = new Sensor(this);
            this.sensor.update();

            if (brain) {
                this.brain = brain;
            } else {
                this.brain = new NeuralNetwork(
                    this.sensor.rayCount,
                    this.controls.numControls
                );
            }    
        }
    }

    /**
     * Draws car based on corners and sensors if exists and specified.
     * 
     * @param ctx 2d context of canvas
     * @param drawSensors true/false
     */
    draw(ctx: CanvasRenderingContext2D, drawSensors : boolean) : void {
        ctx.fillStyle = this.color;
        if (this.damaged) {
            ctx.fillStyle = this.damagedColor;
        }
        
        ctx.beginPath();
        ctx.moveTo(this.corners[0].x,this.corners[0].y)
        for (let i = 1; i < this.corners.length; i++) {
            ctx.lineTo(this.corners[i].x,this.corners[i].y);
        }
        ctx.fill();

        if (this.sensor != null && drawSensors) {
            this.sensor.draw(ctx);
        }
    }  
    
    /**
     * Updates Car's location and state if not damaged. Dummy cars
     * don't need obstacles and list of dummy cars.
     * 
     * @param borders list of all obstacles, default is null
     * @param dummyCars list of dummy cars, default is null
     */
    update(borders : Border[] | null = null, dummyCars : Car[] | null = null) : void {
        if (!this.damaged) {
            this.moveCar();
            this.updateCarCorners();
            this.updateCarBorders();
            
            if (!this.isDummy) {
                let sensor = this.sensor as Sensor;
                this.updateCarsPassed(dummyCars as Car[]);
                sensor.update(borders as Border[]);
                this.updateDamage(borders as Border[]);
    
                const offsets = sensor.getRayValues().map(x => 1-x);
                const out = NeuralNetwork.feedForward(offsets,this.brain as NeuralNetwork);
                this.controls.applyInput(out);
            }
        }
    }

    /**
     * Updates number of dummy cars that have been passed by this car.
     * 
     * @param dummyCars list of all dummy cars
     */
    private updateCarsPassed(dummyCars : Car[]) : void{
        this.carsPassed = 0;
        for (let car of dummyCars) {
            if (this.location.y < car.location.y) {
                this.carsPassed += 1;
            }
        }
    }

    /**
     * Updates car's damaged state to true if collision with obstacle
     * detected.
     * 
     * @param borders of all obstacles to consider
     * @returns nothing if intersection found early
     */
    private updateDamage(borders : Border[]) : void{
        if (!this.damaged) {
            for (let corner of this.corners) {
                let line = new Border(this.location,corner);
                for (let border of borders) {
                    if (Intersect.getPercentUntilWall(line,border) >= 0) {
                        this.damaged = true;
                        return;
                    }
                }
            }
        }
    }

    /**
     * Move car's location based on speed and other factors.
     */
    private moveCar() : void {
        if (Math.abs(this.speed) > 0) {
            if (this.controls.left) {
                this.angle -= this.rotationSpeed * Math.sign(-this.speed);
            }
            if (this.controls.right) {
                this.angle += this.rotationSpeed * Math.sign(-this.speed);
            } 
        }
        if (this.controls.forward) this.speed -= this.acceleration;
        if (this.controls.reverse) this.speed += this.acceleration;

        this.speed *= this.friction;
        if (Math.abs(this.speed) < this.zeroSpeedThresh) this.speed = 0;

        this.speed = Math.min(this.maxSpeed,this.speed);
        this.speed = Math.max(this.maxSpeed*-1,this.speed);

        this.location.x -= this.speed * Math.cos(this.angle - Math.PI/2);
        this.location.y -= this.speed * Math.sin(this.angle - Math.PI/2);
    }

    /**
     * Updates car's corners based on location and angle of car.
     */
    private updateCarCorners() : void {
        let corners = [];
        const radius = Math.hypot(this.width/2,this.height/2);
        const angle = Math.atan2(this.width,this.height);

        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle-angle) * radius ,
            this.location.y - Math.cos(-this.angle-angle) * radius
        ))
        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle+angle) * radius,
            this.location.y - Math.cos(-this.angle+angle) * radius
        ))
        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle-angle+Math.PI) * radius,
            this.location.y - Math.cos(-this.angle-angle+Math.PI) * radius
        ))
        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle+angle+Math.PI) * radius,
            this.location.y - Math.cos(-this.angle+angle+Math.PI) * radius
        ))
        this.corners = corners;
    }

    /**
     * Updates car borders based on its corners.
     */
    private updateCarBorders() : void {
        this.borders = [];
        for (let i = 0; i < this.corners.length; i++) {
            this.borders.push(
                new Border(
                    this.corners[i],
                    this.corners[(i+1) % this.corners.length]
                )
            );
        }
    }

    /**
     * Calculates car performance on a curve based on the
     * following parameters in descending order of importance:
     * 
     * dummy cars passed, y distance traveled forward, no damage
     */
    public calculatePerformance (dummyCars : Car[]) : void {
        let damageScore = this.damaged ? 0 : 1;
        let distanceScore = Math.min(
            1, 
            Math.max(
                Math.max(0,this.location.y / dummyCars[0].location.y),
                -this.location.y / this.distanceForPoint
            )
        );
        
        let passedScore = this.carsPassed / dummyCars.length;

        let priorities = [damageScore,distanceScore,passedScore];
        let score = 0;
        let base = 2;

        for (let i = 0; i < priorities.length; i++) {
            score += base ** (i*2) * priorities[i];
        }

        this.score = score;
    }
}

