import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/components/forms/RegisterForm.module.css";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { validatePassword } from "@/services/validationService";
import Divider from "../shared/Divider";

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

        const passwordValidation = await validatePassword(password);
        if (!passwordValidation.valid) {
            setError(passwordValidation.error || "Invalid password");
            return;
        }


        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) throw new Error("Username already taken");
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            try {
                const defaultAvatar = "/avatar.png";
                await updateProfile(user, { displayName: username, photoURL: defaultAvatar });

                await setDoc(doc(db, "users", user.uid), {
                    username,
                    email,
                    role: "USER",
                    profilePic: defaultAvatar,
                    createdAt: new Date()
                });

            } catch (backendError) {
                await user.delete();
                throw backendError;
            }

            navigate("/");

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered.");
            } else if (err.code === 'auth/password-does-not-meet-requirements') {
                setError("Password needs a special character (e.g., !, @, #).");
            } else {
                setError(err.message);
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
