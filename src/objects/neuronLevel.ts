/**
 * Neuron level consists of input nodes and output nodes
 * such that each input is connected to all output nodes.
 * Strength of connections and at which value nodes 
 * light up is controlled by weights of connections and
 * output thresholds.
 */
export default class NeuronLevel {
    private inputNodes : number[];
    private outputNodes : number[];
    private outputThresh : number[];
    private weights : number[][] = [];
    
    private static maxVal = 3;

    constructor(inputNum : number, outputNum : number) {
        this.inputNodes = new Array(inputNum);
        this.outputNodes = new Array(outputNum);
        this.outputThresh = new Array(outputNum);

        for (let i = 0; i < inputNum; i++) {
            this.weights.push(new Array(outputNum));
        }
        NeuronLevel.randomize(this);
    }

    /**
     * Sets a random value in range [-1,1] to weights and 
     * output threshold in level.
     * 
     * @param level to be randomized
     */
    static randomize(level : NeuronLevel) : void {
        for (let i = 0; i < level.inputNodes.length; i++) {
            for (let j = 0; j < level.outputNodes.length; j++) {
                level.weights[i][j] = Math.random()*2 - 1;
            }
        }
        for (let j = 0; j < level.outputNodes.length; j++) {
            level.outputThresh[j] = Math.random()*2 - 1;
        }
    }

    /**
     * Returns output of last neuron level by passing input values
     * to neural network and going through all the neuron levels.
     * Output of each neuron level is array of 0s and 1s.
     * 
     * @param inputVals Values corresponding to first neuron level.
     * @param level 
     * @returns List of outputs in the last neuron level
     */
    static feedForward(
        inputVals : number[],
        level : NeuronLevel) : number[] 
    {
        for (let i = 0; i < level.inputNodes.length; i++) {
            level.inputNodes[i] = inputVals[i];
        }

        for (let j = 0; j < level.outputNodes.length; j++) {
            let sum : number = 0;
            for (let i = 0; i < level.inputNodes.length; i++) {
                sum += level.inputNodes[i] * level.weights[i][j];
            }
            level.outputNodes[j] = 0;
            
            if (sum >= level.outputThresh[j]) {
                level.outputNodes[j] = 1;
            } 
        }
        return level.outputNodes;
    }


    /**
     * Changes thresholds of output nodes at which output will return 1
     * by a value within [-1*constant,constant]
     * 
     * @param level neuron level that is to be mutated
     * @param constant representing strength of mutation [0,1]
     */
    static mutateOutputThresh(
        level : NeuronLevel,
        constant : number) : void 
    {
        for (let i = 0; i < level.outputThresh.length; i++) {
            level.outputThresh[i] += (Math.random() * 2 - 1) * constant;
            level.outputThresh[i] = 
                this.normalizeValue(level.outputThresh[i]);
        }
    }


    /**
     * Changes weights of all input-output node connections by a value
     * within the range [-1*constant,constant]
     * 
     * @param level 
     * @param constant 
     */
    static mutateWeights(level : NeuronLevel, constant : number) : void {
        for (let i = 0; i < level.weights.length; i++) {
            for (let j = 0; j < level.weights[i].length; j++) {
                level.weights[i][j] += (Math.random() * 2 - 1) * constant;
                level.weights[i][j] = 
                    this.normalizeValue(level.weights[i][j]);
            }
        }
    }

    /**
     * Reduces value to be within range of [-1*maxVal, maxVal] 
     * 
     * @param val 
     * @returns normalized value
     */
    static normalizeValue(val : number) : number {
        return Math.min(
            this.maxVal,
            Math.max(-1 * this.maxVal, val)
        )
    }
}