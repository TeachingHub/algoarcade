import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/components/forms/LoginForm.module.css";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Divider from "../shared/Divider";
import { loginUser } from "@/services/authService";

export default function LoginForm() {
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
        try {
            await loginUser(email, password);
            navigate("/");
        } catch (err: any) {
            setError("Failed to login. Please check your credentials.");
            console.error(err);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>LOGIN</h1>
                    <p className={styles.subtitle}>
                        Access your algorithm<br />
                        training center
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
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

                    <div className={styles.options}>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="remember" className={styles.checkbox} />
                            <label htmlFor="remember" className={styles.checkboxLabel}>
                                Remember me
                            </label>
                        </div>
                        <a href="#" className={styles.forgotLink}>
                            Forgot Password?
                        </a>
                    </div>

                    <Button style={["primary"]} label="LOGIN" type="submit" />
                </form>
                <Divider size="xlarge" thickness="thin" />
                <div className={styles.footer}>
                    <p className={styles.signupText}>Don't have an account?</p>
                    <Button style={["link"]} label="CREATE ACCOUNT" to="/register" />
                </div>
            </div>
        </div>
    );
}