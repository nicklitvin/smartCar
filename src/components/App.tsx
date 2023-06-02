import Simulation from "../objects/simulation";
import LeftPanel from "./LeftPanel";
import styles from "../css/App.module.css";
import React, { useState } from "react";

import info from "../img/info.png";
import unselected from "../img/unselected.png";
import selected from "../img/selected.png";
import exit from "../img/X.png";

export default function App() {
    const canvasName = "canvas";
    const buttonNames = [
        "Start", "Destroy", "New Road", "Refresh Page",
        "Fast Develop","Enable Detailed"
    ];
    const [more, setMore] = useState<boolean>(false);
    const [detail, setDetail] = useState<boolean>(false);
    const [simulation, setSimulation] = useState<Simulation | null>(null);
    const [consoleText, setConsoleText] = useState<String>();
    const [consoleDetail, setConsoleDetail] = useState<String[]>();
    const [consoleLoad, setConsoleLoad] = useState<Boolean>();

    React.useEffect( () => {
        const x = document.getElementById(canvasName) as HTMLCanvasElement;
        const y = new Simulation(false,x);
        setSimulation(y);
        Simulation.initializeReact(setConsoleText,setConsoleLoad, setConsoleDetail, detail);
    },[]);

    const startSimulation = () => {
        const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
        const simulation = new Simulation(false,canvas);
        setSimulation(simulation);
        Simulation.initializeReact(setConsoleText,setConsoleLoad, setConsoleDetail, detail);
        simulation.start();
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

    const refreshPage = () => {
        window.location.reload();
    }

    const speedRun = () => {
        const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
        const simulation = new Simulation(true,canvas);
        setSimulation(simulation);
        Simulation.initializeReact(setConsoleText,setConsoleLoad,setConsoleDetail, detail);
        Simulation.speedBrainDevelopment(canvas);
    }

    const changeDetail = () => {
        setDetail(!detail);
    }

    const RightPanel = () => {
        return (
            <div className={styles.panel}>
                {more ? InfoPanel() : ControlPanel()}
            </div>    
        )
    }

    const changeMore = () => {
        setMore(!more);
    }

    const getConsoleText = () => {
        let elements = [];
        let detailElements = [];

        elements.push(
            <p key="1">{consoleText}</p>
        );
        if (consoleLoad) {
            elements.push(
                <div key="2" className={styles.loading}></div>
            );
        }
        if (detail && consoleDetail) {
            for (let rowIndex in consoleDetail) {
                let row = consoleDetail[rowIndex];
                detailElements.push(
                    <p key={rowIndex}>{row}</p>,
                    <br></br>
                )
            }
        }

        return (
            <div className={styles.consoleContent}>
                <div className={styles.consoleBasic}>
                    {elements}
                </div>
                <div className={styles.consoleDetail}>
                    {detailElements}
                </div>
            </div>
            
        )
    }

    const InfoPanel = () => {
        return(
            <div className={styles.rightPanelContainer}>
                <div className={styles.title}>
                    <h2>More Info</h2>
                    <img src={exit} alt="exit" onClick={changeMore}></img>
                </div>
                <h3>{buttonNames[0]}</h3>
                <ul>
                    <li>Begins a simulation</li>
                    <li>Vehicles continue until passing the course or all have collided with an object</li>
                </ul>
                <h3>{buttonNames[1]}</h3>
                <ul>
                    <li>Deletes the current road and the trained neural network</li>
                </ul>
                <h3>{buttonNames[2]}</h3>
                <ul>
                    <li>Creates a new road for the simulation</li>
                    <li>Neural network data is not deleted</li>
                </ul>
                <h3>{buttonNames[3]}</h3>
                <ul>
                    <li>Refreshes the current page</li>
                    <li>Neural network data is not deleted</li>
                    <li>Use when an unexpected error occurs</li>
                </ul>
                <h3>{buttonNames[4]}</h3>
                <ul>
                    <li>Runs 50 simulations in quick succession</li>
                    <li>Neural network data is saved</li>
                    <li>Summary of develop will be displayed in the console</li>
                </ul>
                <h3>{buttonNames[5]}</h3>
                <ul>
                    <li>Displays more information in the console such as mutation constants and vehicle performance scores</li>
                </ul>

            </div>
        )
    }

    const ControlPanel = () => {
        const selectImg = detail ? 
            <img src={selected} alt="selected" onClick={changeDetail}></img>: 
            <img src={unselected} alt="not-selected" onClick={changeDetail}></img>;

        return (
            <div className={styles.rightPanelContainer}>
                <div className={styles.title}>
                    <h2>Control Panel</h2>
                    <img src={info} alt="info" onClick={changeMore}></img>
                </div>
                <div className={styles.buttons}>
                    <button onClick={startSimulation}>{buttonNames[0]}</button>
                    <button onClick={eraseData}>{buttonNames[1]}</button>
                    <button onClick={newRoad}>{buttonNames[2]}</button>
                    <button onClick={refreshPage}>{buttonNames[3]}</button>
                    <button onClick={speedRun}>{buttonNames[4]}</button>
                </div>
                <div className={styles.detail}>
                    {selectImg}
                    <p>Enable detailed output</p>
                </div>
                <div className={styles.console}>
                    {getConsoleText()}
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