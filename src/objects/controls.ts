/**
 * Controls in 4 directions that can change based on user or automated
 * input.
 */
export default class Controls {
    public left = false;
    public right = false;
    public forward = false;
    public reverse = false;
    public numControls = 4;

    constructor(isDummy : boolean) {
        if (isDummy) {
            this.forward = true;
        } else {
            this.addKeyboardListeners();
        }
    }

    /**
     * Adds keyboard listeners for user manual control with WASD.
     */
    private addKeyboardListeners() : void{
        document.onkeydown = (event) => {
            switch (event.key) {
                case "w":
                    this.forward = true; 
                    break;
                case "a":
                    this.left = true;
                    break;
                case "s":
                    this.reverse = true;
                    break;
                case "d":
                    this.right = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "w":
                    this.forward = false; 
                    break;
                case "a":
                    this.left = false;
                    break;
                case "s":
                    this.reverse = false;
                    break;
                case "d":
                    this.right = false;
                    break;
            }
        }
    }

    /**
     * Sets controls to true or false based on value at index.
     * Input list comes from Neural Network output.
     * [forward,reverse,left,right] 
     * 
     * @param input [] of length 4 with 0s and 1s
     */
    applyInput(input : number[]) : void {
        input[0] == 1 ? this.forward = true : this.forward = false;
        input[1] == 1 ? this.reverse = true : this.reverse = false;
        input[2] == 1 ? this.left = true : this.left = false;
        input[3] == 1 ? this.right = true : this.right = false;
    }
}