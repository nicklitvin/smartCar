import Simulation from "../objects/simulation";
import LeftPanel from "./LeftPanel";
import InfoPanel from "./InfoPanel";
import ControlPanel from "./ControlPanel";
import styles from "../css/App.module.css";

export default function App() {
    const canvasName = "canvas";
    const moreInfo : boolean = false;
    let simulation : Simulation;

    const createCanvas = () => {
        return(
            <canvas id={canvasName} className={styles.canvas}></canvas>
        )
    }

    const createSimulation = () => {
        const element = document.getElementById(canvasName); 
        const canvas = element as HTMLCanvasElement;
    
        simulation = new Simulation(false,canvas);
        simulation.start();
    }

    const rightPanel = () => {
        if (moreInfo) return InfoPanel();
        else return ControlPanel();
    }

    return(
        <div className={styles.container}>
            <div className={styles.panel}>{LeftPanel()}</div>
            {createCanvas()}
            {/* <button onClick={createSimulation}>asd</button> */}
            <div className={styles.panel}>{rightPanel()}</div>
        </div>
    )
}