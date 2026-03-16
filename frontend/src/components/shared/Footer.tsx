import styles from "@/styles/components/shared/Footer.module.css";
import Divider from "./Divider";
import { Link } from "react-router";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.sections}>
                    <div className={styles.section}>
                        <h3>ALGOARCADE</h3>
                        <p>An interactive platform for learning algorithms through games.</p>
                        <p>Final Degree Project — Software Engineering.</p>
                    </div>
                    <div className={styles.section}>
                        <h3>Games</h3>
                        <Link to="/games/tsp" className={styles.footerLink}>Traveling Salesperson</Link>
                        <Link to="/games/pathfinding" className={styles.footerLink}>Pathfinding</Link>
                    </div>
                    <div className={styles.section}>
                        <h3>Links</h3>
                        <Link to="/" className={styles.footerLink}>Home</Link>
                        <Link to="/games" className={styles.footerLink}>Games</Link>
                        <Link to="/profile" className={styles.footerLink}>Profile</Link>
                    </div>
                    <div className={styles.section}>
                        <h3>Contact</h3>
                        <a href="mailto:dani@santos-studio.es" className={styles.footerLink}>dani@santos-studio.es</a>
                    </div>
                </div>
                <Divider size="large" thickness="medium" />
                <div className={styles.bottom}>
                    <p>© 2026 ALGOARCADE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}