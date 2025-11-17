import styles from "@/styles/components/shared/Header.module.css";
import Button from "./Button";


export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <h1>ALGOARCADE</h1>
                </div>
                <div className={styles.navigation}>
                    <div className={styles.navLinks}>
                        <Button style={["link"]} label="HOME" />
                        <Button style={["link"]} label="GAMES" />
                        <Button style={["link"]} label="BLOG" />
                    </div>
                    <Button style={["primary"]} label="LOGIN" />
                </div>
            </div>
        </header>
    );
}