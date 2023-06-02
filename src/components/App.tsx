import Simulation from "../objects/simulation";
import LeftPanel from "./LeftPanel";
// import InfoPanel from "./InfoPanel";
import styles from "../css/App.module.css";
import React, { useState } from "react";

import info from "../img/info.png";
import unselected from "../img/unselected.png";
import selected from "../img/selected.png";

export default function App() {
    const canvasName = "canvas";
    const [detail, setDetail] = useState<boolean>(false);
    const [simulation, setSimulation] = 
        useState<Simulation | null>(null);

    React.useEffect( () => {
        const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
        const simulation = new Simulation(false,canvas);
        setSimulation(simulation);
    }, [])

    const startSimulation = () => {
        if (simulation) {
            simulation.start();
        } else {
            const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
            const curr = new Simulation(false,canvas);
            setSimulation(curr);
        }
    }

    const eraseData = () => {
        Simulation.destroyAll();
    }

    const newRoad = () => {
        if (simulation) {
            simulation.newRoad();
        } else {
            console.log("no road");
        }
    }

    const startAgain = () => {
        Simulation.startAgain();
    }

    const speedRun = () => {
        const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
        Simulation.speedBrainDevelopment(canvas);
    }

    const changeDetail = () => {
        setDetail(!detail);
    }

    const RightPanel = () => {
        const selectImg = detail ? 
            <img src={selected} alt="selected" onClick={changeDetail}></img>: 
            <img src={unselected} alt="not-selected" onClick={changeDetail}></img>;

        return (
            <div className={styles.panel}>
                <div className={styles.rightPanelContainer}>
                    <div className={styles.title}>
                        <h2>Control Panel</h2>
                        <img src={info} alt="info"></img>
                    </div>
                    <div className={styles.buttons}>
                        <button onClick={startSimulation}>Start</button>
                        <button onClick={eraseData}>Erase Data</button>
                        <button onClick={newRoad}>New Road</button>
                        <button onClick={startAgain}>Start Again</button>
                        <button onClick={speedRun}>Fast Develop</button>
                    </div>
                    <div className={styles.detail}>
                        {selectImg}
                        <p>Enable detailed output</p>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className={styles.container}>
            <div className={styles.panel}>{LeftPanel()}</div>
            <canvas id={canvasName} className={styles.canvas}></canvas>
            {RightPanel()}
        </div>
    )
}