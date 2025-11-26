import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/components/forms/RegisterForm.module.css";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";

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

    const checkUsernameAvailability = async (username: string) => {
        const response = await fetch(`http://localhost:3000/api/auth/check-username?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Username not available");
        }
        return true; 
    };

    const registerInBackend = async (uid: string, email: string, username: string) => {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, email, username }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Backend registration failed");
        }
        return response.json();
    };

    // 3. Tu handleSubmit limpio
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            await checkUsernameAvailability(username); 

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            try {
                await registerInBackend(user.uid, user.email!, username);
            } catch (backendError: any) {
                console.error("Rollback: Deleting Firebase user due to backend error");
                await user.delete(); 
                throw backendError; 
            }

            navigate("/");

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered.");
            } else if (err.message.includes("Username")) { 
                setError(err.message);
            } else {
                setError("Failed to create account. " + err.message);
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

                <div className={styles.footer}>
                    <p className={styles.loginText}>Already have an account?</p>
                    <Button style={["secondary"]} label="LOGIN" to="/login" />
                </div>
            </div>
        </div>
    );
}
