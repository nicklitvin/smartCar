import Simulation from "./Simulation";
import LeftPanel from "./LeftPanel";
import InfoPanel from "./InfoPanel";
import ControlPanel from "./ControlPanel";
import styles from "../css/App.module.css";

export default function App() {
    const moreInfo : boolean = false;

    const rightPanel = () => {
        if (moreInfo) return InfoPanel();
        else return ControlPanel();
    }

    return(
        <div className={styles.container}>
            <div className={styles.panel}>{LeftPanel()}</div>
            <div className={styles.simulation}>{Simulation()}</div>
            <div className={styles.panel}>{rightPanel()}</div>
        </div>
    )
}