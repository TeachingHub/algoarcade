import { useAuth } from "@/context/AuthContext";
import Button from "@/components/shared/Button";
import { TriangleAlertIcon } from 'lucide-react';
import styles from "@/styles/components/games/shared/GameNotLoggedMessage.module.css";


export default function GameNotLoggedMessage() {
    const { user } = useAuth();

    if (user) return null;

    return (
        <div className={styles.notification}>
            <TriangleAlertIcon size={20} />
            <span>Progress not saved. Log in to track your scores!</span>
            <Button style={["link"]} to="/login">Log in</Button>
            <span>or</span>
            <Button style={["link"]} to="/register">Register</Button>
        </div>
    );
}
