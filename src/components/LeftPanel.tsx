import styles from "../css/LeftPanel.module.css";

import figma from "../img/figma.png";
import github from "../img/github.png";
import linkedin from "../img/linkedin.png";
import source from "../img/source.png";
import youtube from "../img/youtube.png";

export default function LeftPanel() {
    const linkData = [
        [linkedin, "LinkedIn", "https://www.linkedin.com/in/nick-litvinov/"],
        [github, "GitHub", "https://github.com/nicklitvin"],
        [youtube, "Video Inspiration", "https://www.youtube.com/watch?v=Rs_rAxEsAvI&t"],
        [source, "Source Code", "https://github.com/nicklitvin/smartCar"],
        [figma, "Figma Design", "https://www.figma.com/file/K5qnbdu6z6nKgJvXspTXH3/Untitled?type=design&node-id=1-3&t=3ej0OKKuwCDez23e-0"],
    ] 

    const getLinkElements = () => {
        const result = [];
        for (let row of linkData) {
            const rowElements = [];
            rowElements.push(<img src={row[0]} alt={row[1]} key="img"></img>);
            rowElements.push(<h3 key="txt">{row[1]}</h3>)
            result.push(
                <a key={row[1]} href={row[2]}>
                    <div key={row[1]} className={styles.rowLink}>
                        {rowElements}
                    </div>
                </a>
                
            )
        }
        return(
            <div className={styles.linkContainer}>
                {result}
            </div>
        )
    }

    return(
        <div className={styles.container}>
            <div className={styles.title}>
                <h1>Smart Car</h1>
                <p>A neural network vehicle simulation</p>
                <p>by Nick Litvinov</p>
            </div>
            {getLinkElements()}
        </div>
    )
}