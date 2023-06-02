import Car from "./car";
import Road from "./road";
import NeuralNetwork from "./neuralNetwork";
import Border from "./border";

import Messages from "./msg";

/**
 * Simulation class creates a simulation where smart cars
 * controlled by a neural network make decisions to pass as
 * many dummy cars on the road. The best results are saved
 * and improved upon with mutations to achieve the smartest
 * neural network.
 */
export default class Simulation {
    // localStorageKeys
    private readonly storageBrainKey = "bestBrain";
    private readonly storageScoreKey = "bestScore";
    private readonly storageDummiesKey = "dummyCars";
    private readonly storageFailKey = "failCount";
    private readonly storageMutateKey = "mutationConstant";

    // adjustable values for fast develop
    private readonly defaultDummyYSeperation = 200;
    private readonly defaultMutationConstant = 1.5;
    private readonly defaultDummyRowFill = 0.4;
    private readonly speedProgressCheck = 120;

    // adjustable values
    private readonly numSmartCars = 100;
    private readonly startY = 0;
    private readonly mutationShrink = 0.5;
    private readonly mutationGrowth = 1.02;
    private readonly minMutationConstant = 0.1;
    private readonly maxMutationConstant = 3;
    private readonly progressCheckSec = 2.5;
    private readonly drawSensors = true;
    private readonly roadBorder = 10;
    private readonly restartOnFinish = false;
    private readonly continuouslyRun = true;
    private readonly carYRelativeToCanvas = 0.8;
    private readonly roadScreenLength = 50;
    private readonly improvementMin = 1.02;
    private readonly dummyDistanceShrink = 0.9;
    private readonly dummyCountGrowth = 1.5;
    private readonly completesToAddDifficulty = 2;
    private readonly completesToIncreaseRowFill = 30; 
    private readonly carWidthToLaneWidth = 0.6;
    private readonly carHeightToLaneWidth = 0.9;

    // adjustable values
    private startLane = 1;
    private dummyYSeperation = 200;
    private maxDummyRowFill = 0.4;
    private speedMaxRuns = 60*40;
    private laneCount = 3;
    private numDummyCars = 10;    
    private dummyHeadStart = 200;
    
    private static speedCompletes = 0;
    private static readonly brainDevelopmentCycles = 50;
    private static readonly speedBruteForceRoad = true;

    private timesUp = false;
    private courseCompleted = false;
    private lastTopScore = 0;
    private isSpeedRun = false;
    private speedRunsCounter = 0;
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private smartCars : Car[] = [];
    private dummyCars : Car[] = [];
    private road : Road;
    private mutationConstant : number;

    public static isReact : boolean = false;
    public static setConsoleText : Function;
    public static setConsoleLoad : Function;
    public static setConsoleDetail : Function;
    public static detailedConsole : boolean;

    constructor(isSpeedRun : boolean, canvas : HTMLCanvasElement) {
        this.isSpeedRun = isSpeedRun;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        this.road = new Road(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width - this.roadBorder * 2,
            this.canvas.height * this.roadScreenLength,
            this.laneCount
        );

        this.mutationConstant = this.defaultMutationConstant;
        let savedMutationConstant = localStorage.getItem(
            this.storageMutateKey
        );
        if (savedMutationConstant) {
            this.mutationConstant = Number(savedMutationConstant);
        }

        this.smartCars = this.generateSmartCars();
        this.dummyCars = this.generateDummyCars();
    }

    /**
     * Enables the updating of console text and load image for front-end React
     * given the set function for each variable.
     * 
     * @param setConsoleText 
     * @param setConsoleLoad 
     */
    public static initializeReact(setConsoleText : Function, setConsoleLoad : Function,
        setConsoleDetail : Function, detailedConsole : boolean = false
    ) {
        Simulation.isReact = true;
        Simulation.setConsoleText = setConsoleText;
        Simulation.setConsoleLoad = setConsoleLoad;
        Simulation.detailedConsole = detailedConsole;
        Simulation.setConsoleDetail = setConsoleDetail;
    }

    public detectNetwork() {
        if (localStorage.getItem(this.storageBrainKey)) {
            Simulation.setConsoleText(Messages.detected);
        } else {
            Simulation.setConsoleText(Messages.undetected);
        }
    }

    /**
     * If brain stored in localstorage from previous session, cars are
     * generated with the same brain but mutated by a mutation constant.
     * 
     * Else, cars are generated with random brains.
     * 
     * @returns List of smart cars with brains
     */
    private generateSmartCars() : Car[] {
        let cars : Car[] = [];

        for (let i = 0; i < this.numSmartCars; i++) {
            let brainText = localStorage.getItem(this.storageBrainKey);
            let brain : NeuralNetwork = JSON.parse(brainText as string);
            
            if (i > 0 && brain) {
                NeuralNetwork.mutate(brain,this.mutationConstant);
            }
            let car = new Car(
                this.road.getLaneXval(this.startLane),this.startY,
                this.road.laneWidth * this.carWidthToLaneWidth,
                this.road.laneWidth * this.carHeightToLaneWidth,
                false,brain
            );
            cars.push(car);
        }
        return cars;
    }

    /**
     * If dummy cars stored in localStorage, load those dummies.
     * 
     * Else create dummy cars, then load them.
     * 
     * @returns List of dummy cars
     */
    private generateDummyCars() : Car[] {
        if (JSON.parse(
            localStorage.getItem(this.storageDummiesKey) as string) == null) 
        {
            this.createAndSaveDummyCars();
        }

        let cars : Car[] = [];
        let dummiesText = localStorage.getItem(this.storageDummiesKey);
        const dummies : Car[] = JSON.parse(dummiesText as string);

        for (let dummy of dummies) {
            let car = new Car(
                dummy.location.x,dummy.location.y,
                this.carWidthToLaneWidth * this.road.laneWidth,
                this.carHeightToLaneWidth * this.road.laneWidth,
                true
            )
            cars.push(car);
        }
        return cars;
    }

    /**
     * Create "numDummyCars" dummy cars such that it is possible to pass
     * them.
     */
    private createAndSaveDummyCars() : void {
        let currY = this.startY - this.dummyHeadStart;
        let cars : Car[] = [];
        let lanesTaken : number[] = [];
    
        for (let i = 0; i < this.numDummyCars; i++) {
            
            if (lanesTaken.length + 1 > Math.floor(
                this.laneCount * this.maxDummyRowFill))
            {
                currY -= this.dummyYSeperation;
                lanesTaken = [];
            }
    
            let lane = Math.floor((Math.random()*this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
    
            let car = new Car(
                this.road.getLaneXval(lane + 1),currY,
                this.carWidthToLaneWidth * this.road.laneWidth,
                this.carHeightToLaneWidth * this.road.laneWidth
            )
            cars.push(car);
        }

        cars = cars.sort( (a,b) => a.location.y - b.location.y);

        localStorage.setItem(this.storageDummiesKey,JSON.stringify(cars));
    }
    
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    public static destroyAll() : void {
        localStorage.clear();
        if (this.isReact) {
            this.setConsoleText(Messages.destroyed());
            this.setConsoleLoad(false);
            this.setConsoleDetail();
        }
    }

    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    public start() : void {
        this.logStart();
        if (this.isSpeedRun) {
            while (this.speedRunsCounter < this.speedMaxRuns){
                if (this.speedRunsCounter % this.speedProgressCheck == 0) {
                    this.updateSimulationStatus();
                }
                if (this.timesUp) break;
                this.run();
                this.speedRunsCounter++;
            }
            if (!this.timesUp) {
                this.timesUp = true;
            }
            this.run();
        } else {
            this.setTimer();
            this.run();
        }
    }

    /**
     * Sets timer that stops when cars are not making any progress
     * and alerts if no more progress can be made.
     */
    private setTimer() : void {
        let timeInterval = this.progressCheckSec * 1000;
        setTimeout( () => this.updateSimulationStatus(),timeInterval);
    }

    private updateSimulationStatus() : void {
        this.sortCarsByPerformance();
        let bestCar = this.smartCars[0];

        if (bestCar.carsPassed >= this.numDummyCars) {
            console.log("Course complete, create new road");
            this.courseCompleted = true;
            this.timesUp = true;
        } else if (
            bestCar.score > this.lastTopScore * this.improvementMin) 
        {
            this.lastTopScore = bestCar.score;
            if (!this.isSpeedRun) this.setTimer();
        } else {
            this.timesUp = true
        }
    }

    /**
     * Runs simulation by updating canvas and status of all cars until
     * all smart cars are damaged or the timer runs out. If 
     * this.startAgain is true, starts the simulation again.
     */
    private run () : void {
        this.smartCars.sort( (a,b) => a.location.y - b.location.y);
        if (!this.isSpeedRun) {
            this.canvas.height = window.innerHeight;
            this.ctx.save();
            this.ctx.translate(
                0,
                -this.smartCars[0].location.y +
                this.canvas.height * this.carYRelativeToCanvas
            );
        }

        this.moveDrawDummyCars();
        this.moveDrawSmartCars();

        if (!this.isSpeedRun) {
            this.road.draw(this.ctx);
            this.ctx.restore();
        }
        
        if (this.timesUp) {
            this.resolveSimulation();
            this.logResults();

            if (this.isSpeedRun) return;
            else if (this.restartOnFinish) {
                Simulation.startAgain();
            }
            this.timesUp = false;
        } else if (this.continuouslyRun && !this.isSpeedRun) {
            requestAnimationFrame(this.run.bind(this));
        }
    }

    /**
     * Moves and draws all cars in this.dummyCars.
     */
    private moveDrawDummyCars() : void {
        for (let car of this.dummyCars) {
            car.update();
            if (!this.isSpeedRun) car.draw(this.ctx,false);
        }
    }

    /**
     * @returns borders of walls and dummyCars
     */
    private getBorders() : Border[] {
        let borders : Border[] = this.road.borders;
        for (let car of this.dummyCars) {
            borders = borders.concat(car.borders);
        }
        return borders;
    }

    /**
     * Moves and draws all cars in this.smartCars.
     */
    private moveDrawSmartCars() : void {
        let borders = this.getBorders();
        let first = true;

        for (let car of this.smartCars) {
            car.update(borders,this.dummyCars);
    
            if (first) {
                if (!this.isSpeedRun) car.draw(this.ctx,this.drawSensors);
                first = false;
            } else {
                if (!this.isSpeedRun) car.draw(this.ctx,false);
            }
        }
    }

    /**
     * If best score in this simulation is greater than the saved high
     * score, updates saved brain.
     * 
     * Else increases mutation constant.
     */
    private resolveSimulation() : void {
        this.sortCarsByPerformance();

        let highScore = Number(localStorage.getItem(this.storageScoreKey));
        let scoreToBeat = Number(highScore) * this.improvementMin;
        let bestScore = this.smartCars[0].score;

        if (highScore != null && bestScore < scoreToBeat &&
            !this.courseCompleted) 
        {
            this.increaseMutationConstant();
        } else {
            this.saveBestBrain();
        }
    
        localStorage.setItem(
            this.storageScoreKey, String(this.smartCars[0].score)
        );
    }

    /**
     * Reduces mutation constant and saves brain with other variables to
     * localstorage.
     */
    private saveBestBrain() : void {
        let previousBest = localStorage.getItem(this.storageScoreKey);
        let currBest = this.smartCars[0].score;
        let previousMutation = this.mutationConstant;
        let resetMutation = false;

        console.log("saving best brain");
        let bestBrain = JSON.stringify(this.smartCars[0].brain);
        let mutationConstant = this.mutationConstant * this.mutationShrink;
        if (mutationConstant < this.minMutationConstant) {
            mutationConstant = this.defaultMutationConstant;
            resetMutation = true;
            console.log("mutation constant too low, reseting value");
        }

        localStorage.setItem(this.storageBrainKey,bestBrain);
        localStorage.setItem(
            this.storageMutateKey,
            String(mutationConstant)
        );
        localStorage.setItem(this.storageFailKey,String(0));

        if (Simulation.isReact) {
            Simulation.setConsoleLoad(false);

            if (this.courseCompleted) {
                Simulation.setConsoleText(Messages.completed());

                Simulation.detailedConsole ? 
                    Simulation.setConsoleDetail( Messages.courseDetail(
                        previousBest,currBest,previousMutation,mutationConstant,
                        resetMutation, 0
                    )) :
                    Simulation.setConsoleDetail();
            } else {
                Simulation.setConsoleText(Messages.improved);
                
                Simulation.detailedConsole ? 
                    Simulation.setConsoleDetail( Messages.courseDetail(
                        previousBest,currBest,previousMutation,mutationConstant,
                        resetMutation, 0
                    )) :
                    Simulation.setConsoleDetail();
            }
        }
    }

    /**
     * Increases mutation constant depending on growth constant and 
     * number of consecutive failures to progress, but resets to 
     * default when greater than the max allowed value. Saves
     * constant and fails to localstorage.
     */
    private increaseMutationConstant() : void {
        console.log("not enough improvement, increasing mutation");
        let previousBest = localStorage.getItem(this.storageScoreKey);
        let failCount = Number(
            localStorage.getItem(this.storageFailKey)
        );
        let previousMutation= this.mutationConstant;
        let newConstant = this.mutationConstant * (
                this.mutationGrowth ** failCount
        );
        let reset = false;
        if (newConstant > this.maxMutationConstant) {
            newConstant = this.defaultMutationConstant;
            failCount = -1;
            reset = true;
            console.log("mutation constant too high, reseting value");
        }

        localStorage.setItem(this.storageMutateKey,
            String(newConstant)
        );
        localStorage.setItem(this.storageFailKey,
            String(failCount + 1)
        );

        if (Simulation.isReact) {
            Simulation.setConsoleText(Messages.noImprove());
            Simulation.setConsoleLoad(false);
            Simulation.detailedConsole ? 
                Simulation.setConsoleDetail( Messages.courseDetail(
                    previousBest,this.smartCars[0].score,
                    previousMutation, newConstant, reset,
                    localStorage.getItem(this.storageFailKey)
                )) :
                Simulation.setConsoleDetail();
        }
    }

    /**
     * Refreshes page.
     */
    public static startAgain() : void {
        // location.reload();
    }

    /**
     * Create and save a traffic arrangement to local storage.
     * Reset best score for next map.
     */
    public newRoad(restart = false) : void {
        this.createAndSaveDummyCars();
        localStorage.setItem(this.storageScoreKey,String(0));
        localStorage.setItem(
            this.storageMutateKey,
            String(this.defaultMutationConstant)
        );
        console.log("new road created");
        if (Simulation.isReact) {
            Simulation.setConsoleText(Messages.newRoad());
            Simulation.setConsoleLoad(false);
            Simulation.setConsoleDetail();
        }
        if (restart) {
            setTimeout(() => Simulation.startAgain(), 1000);
        }
    }

    /**
     * Logs initial data.
     */
    private logStart() : void {
        if (Simulation.isReact && !this.isSpeedRun) {
            Simulation.setConsoleText(Messages.start());
            Simulation.setConsoleLoad(true);
            Simulation.setConsoleDetail();
        }
        console.log("==============")
        console.log("mutation constant: ", this.mutationConstant);
        console.log("previous best score: ", 
            localStorage.getItem(this.storageScoreKey)
        );
        console.log("failure streak: ", 
            localStorage.getItem(this.storageFailKey)
        );
    }

    /**
     * Logs results of simulation.
     */
    private logResults() : void {
        console.log("new mutation constant: ", 
            localStorage.getItem(this.storageMutateKey)
        );
        console.log("current best score: ", this.smartCars[0].score);
        console.log("failure streak: ", 
            localStorage.getItem(this.storageFailKey)
        );
        console.log("==============")
    }

    /**
     * Sort cars by performance and save order. Cars passed is
     * the most important attribute in scoring.
     */
    private sortCarsByPerformance() : void {
        this.smartCars.forEach(car => car.calculatePerformance(
            this.dummyCars
        ));
        this.smartCars.sort( (a,b) => b.score - a.score);
    }

    /**
     * Runs simulation many times, gradually increasing difficulty.
     * Brain is saved to localstorage as usual. 
     * 
     * @param canvas for proper visuals after development
     */
    public static async speedBrainDevelopment (
        canvas : HTMLCanvasElement) 
    {
        let cycle = 0;

        while (cycle < Simulation.brainDevelopmentCycles) {
            if (this.isReact) {
                Simulation.setConsoleText(Messages.fastDevelop(cycle,Simulation.brainDevelopmentCycles));
                Simulation.setConsoleLoad(true);
                Simulation.setConsoleDetail();
                await new Promise(resolve => setTimeout(resolve,0));
            }

            console.log("CYCLE",cycle);
            let simulation = new Simulation(true,canvas);
            if (cycle == 0 && !this.speedBruteForceRoad) simulation.newRoad(false); 
            simulation.start();
            if (simulation.courseCompleted) {
                Simulation.speedCompletes++;
                if (Simulation.speedCompletes %
                    simulation.completesToAddDifficulty == 0) 
                {
                    simulation.increaseDifficulty();
                }
                simulation.newRoad(false);
            } 
            cycle++;
        }
        console.log("fast develop complete");
        console.log(`courses completed: ${Simulation.speedCompletes}`)

        if (this.isReact) {
            Simulation.setConsoleText(
                Messages.fastCompleted(
                    Simulation.speedCompletes, Simulation.brainDevelopmentCycles
                )
            );
            Simulation.setConsoleLoad(false);
        }
        Simulation.speedCompletes = 0;
    }

    /**
     * Increases difficulty of new road based on complete count.
     */
    private increaseDifficulty() : void {
        if (Simulation.speedCompletes %
            this.completesToIncreaseRowFill == 0) 
        {
            let newFill = this.maxDummyRowFill + 1 / this.laneCount;
            if (newFill < 1) {
                this.maxDummyRowFill += 1 / this.laneCount;
                this.dummyYSeperation = this.defaultDummyYSeperation * 
                    this.maxDummyRowFill * this.laneCount;
            } else {
                this.laneCount += 1;
                this.maxDummyRowFill = this.defaultDummyRowFill;
                this.dummyYSeperation = this.defaultDummyYSeperation;
            }
        } else {
            let choices = 3;
            let choice = Math.floor(Math.random() * choices - 0.001);
            switch(choice) {
                case 0: {
                    this.startLane = (this.startLane + 1) & this.laneCount;
                    break;
                }
                case 1: {
                    this.dummyYSeperation *= this.dummyDistanceShrink;
                    break;
                }
                case 2: {
                    this.numDummyCars *= this.dummyCountGrowth;
                    this.speedMaxRuns *= this.dummyCountGrowth; 
                    break;
                }
            }
        }
    }
}