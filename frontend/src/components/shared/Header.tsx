import styles from "@/styles/components/shared/Header.module.css";
import Button from "./Button";
import Avatar from "./Avatar";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router";

export default function Header() {
    const { user, userProfile } = useAuth();

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
                        <Link to="/profile" aria-label="Profile">
                            <Avatar
                                src={userProfile?.profilePic || user.photoURL}
                                fallback={user.displayName || userProfile?.username || user.email || "?"}
                                size="medium"
                            />
                        </Link>
                    ) : (
                        <Button to="/login" style={["primary"]} label="LOGIN" />
                    )}
                </div>
            </div>
        </header>
    );
}