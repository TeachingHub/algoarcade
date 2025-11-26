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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: username
            });
            console.log(userCredential);
            const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: userCredential.user.uid,       // La pieza clave
                email: userCredential.user.email,
                username: userCredential.user.displayName
            }),
        });

        if (!response.ok) {
            // Si tu backend falla (ej: username duplicado), podrías querer borrar el usuario de Firebase
            // para no dejar datos inconsistentes, o simplemente mostrar el error.
            const errorData = await response.json();
            throw new Error(errorData.error || "Error creando usuario en backend");
        }
            
            navigate("/");
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please login instead.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 8 characters long.");
            } else if (err.code === 'auth/invalid-email') {
                setError("Please enter a valid email address.");
            } else {
                setError("Failed to create account. Please try again later.");
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
