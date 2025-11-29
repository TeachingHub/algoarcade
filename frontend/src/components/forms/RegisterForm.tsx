import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/components/forms/RegisterForm.module.css";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { validatePassword, validateUsernameAvailability } from "@/services/validationService";
import Divider from "../shared/Divider";
import { registerUser } from "@/services/authService";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate("/profile");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Password validation
        const passwordValidation = await validatePassword(password);
        if (!passwordValidation.valid) {
            setError(passwordValidation.error || "Invalid password");
            return;
        }

        try {
            // Username validation
            const isUsernameAvailable = await validateUsernameAvailability(username);
            if (!isUsernameAvailable) {
                setError("Username already taken");
                return;
            }

            // Register user
            await registerUser(email, password, username);
            navigate("/");

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered.");
            } else if (err.code === 'auth/password-does-not-meet-requirements') {
                setError("Password needs a special character (e.g., !, @, #).");
            } else {
                setError(err.message || "Failed to register");
            }
        }
    };


    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>REGISTER</h1>
                    <p className={styles.subtitle}>
                        Join the algorithm<br />
                        training center
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>USERNAME</label>
                        <Input
                            type="text"
                            placeholder="PlayerOne"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>EMAIL ADDRESS</label>
                        <Input
                            type="email"
                            placeholder="player@algoarcade.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>PASSWORD</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button style={["primary"]} label="CREATE ACCOUNT" type="submit" />
                </form>
                <Divider size="xlarge" thickness="thin" />
                <div className={styles.footer}>
                    <p className={styles.loginText}>Already have an account?</p>
                    <Button style={["link"]} label="LOGIN" to="/login" />
                </div>
            </div>
        </div>
    );
}
