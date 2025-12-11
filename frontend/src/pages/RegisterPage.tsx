import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { validatePassword, validateUsernameAvailability } from "@/services/validationService";
import Layout from "@/layouts/Layout";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/forms/Form.module.css";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user, register } = useAuth();

    if (user) {
        navigate("/profile");
    }

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
            await register(email, password, username);
            navigate("/profile");

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
        <Layout>
            <FormWrapper
                title="REGISTER"
                subtitle={<>Join the algorithm<br />training center</>}
                onSubmit={handleSubmit}
                error={error}
                footer={
                    <>
                        <p className={styles.footerText}>Already have an account?</p>
                        <Button style={["link"]} label="LOGIN" to="/login" />
                    </>
                }
            >
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
            </FormWrapper>
        </Layout>
    );
}