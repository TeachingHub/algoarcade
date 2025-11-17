import styles from "@/styles/components/shared/Footer.module.css";
import Divider from "./Divider";


export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.sections}>
                    <div className={styles.section}>
                        <h3>About Us</h3>
                        <p>Information about the company.</p>
                        <p>Information about the company.</p>
                        <p>Information about the company.</p>
                        <p>Information about the company.</p>
                        <p>Information about the company.</p>
                        <p>Information about the company.</p>
                        <p>Information about the company.</p>
                    </div>
                    <div className={styles.section}>
                        <h3>Contact</h3>
                        <p>Email: contact@algoarcade.com</p>
                        <p>Email: contact@algoarcade.com</p>
                        <p>Email: contact@algoarcade.com</p>
                        <p>Email: contact@algoarcade.com</p>
                    </div>
                    <div className={styles.section}>
                        <h3>Juegos</h3>
                        <p> {'>'}juego 1: TSP</p>
                        <p> {'>'}juego 2: Pathfinder A*</p>
                        <p> {'>'}juego 3: visualgo</p>
                        <p> {'>'}juego 1: TSP</p>
                        <p> {'>'}juego 2: Pathfinder A*</p>
                        <p> {'>'}juego 3: visualgo</p>
                        <p> {'>'}juego 1: TSP</p>
                        <p> {'>'}juego 2: Pathfinder A*</p>
                        <p> {'>'}juego 3: visualgo</p>
                    </div>
                </div>
                <Divider size="large" thickness="medium" />
                <div className={styles.bottom}>
                    <p>© 2025 ALGOARCADE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}