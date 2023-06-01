import React from "react";
import styles from "../css/Simulation.module.css";

export default class Simulation extends React.Component {
  

  render() {
    return(
      <canvas id="canvas" className={styles.canvas}></canvas>
    )
  }
}