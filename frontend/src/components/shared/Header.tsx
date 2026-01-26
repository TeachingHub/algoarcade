import styles from "@/styles/components/shared/Header.module.css";
import Button from "./Button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const { user } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <h1>ALGOARCADE</h1>
                </div>
                <div className={styles.navigation}>
                    <div className={styles.navLinks}>
                        <Button style={["link"]} label="HOME" to="/" />
                        <Button style={["link"]} label="GAMES" to="/games" />
                        <Button style={["link"]} label="BLOG" to="/blog" />
                    </div>
                    {user ? (
                        <Button to="/profile" style={["primary"]} label={user.displayName || "PROFILE"} />
                    ) : (
                        <Button to="/login" style={["primary"]} label="LOGIN" />
                    )}
                </div>
            </div>
        </header>
    );
}