import { useState } from "react";
import styles from "@/styles/components/shared/Header.module.css";
import Button from "./Button";
import Avatar from "./Avatar";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";

export default function Header() {
    const { user, userProfile } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <Link to="/" className={styles.logo}>
                    <h1>ALGOARCADE</h1>
                </Link>
                
                <button 
                    className={styles.menuButton} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`${styles.navigation} ${isMenuOpen ? styles.navigationOpen : ''}`}>
                    <div className={styles.navLinks}>
                        {userProfile?.role === "ADMIN" && (
                            <Button style={["link"]} label="ADMIN" to="/admin" />
                        )}
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