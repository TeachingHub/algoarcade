import styles from "@/styles/components/shared/Footer.module.css";
import Button from "./Button";
import Divider from "./Divider";


export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.sections}>
                    <div className={styles.section}>
                        <h3>About Us</h3>
                        <p>Information about the company.</p>
                    </div>
                    <div className={styles.section}>
                        <h3>Contact</h3>
                        <p>Email: contact@algoarcade.com</p>
                    </div>
                    <div className={styles.section}>
                        <h3>Follow Us</h3>
                        <div className={styles.socialButtons}>
                            <Button style={["link"]} label="Twitter" to="https://twitter.com/algoarcade" target="blank" />
                            <Button style={["link"]} label="Facebook" to="https://facebook.com/algoarcade" target="blank" />
                            <Button style={["link"]} label="Instagram" to="https://instagram.com/algoarcade" target="blank" />
                        </div>
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