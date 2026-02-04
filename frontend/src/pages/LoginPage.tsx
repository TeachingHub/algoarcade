import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/layouts/Layout";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/forms/Form.module.css";

import Divider from "@/components/shared/Divider";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user, login, loginWithGoogle } = useAuth();

    if (user) {
        navigate("/");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/profile");
        } catch (err: any) {
            setError("Failed to login. Please check your credentials.");
            console.error(err);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate("/profile");
        } catch (err: any) {
            console.error(err);
            setError("Failed to login with Google.");
        }
    };

    return (
        <Layout>
            <FormWrapper
                title="LOGIN"
                subtitle={<>Access your algorithm<br />training center</>}
                onSubmit={handleSubmit}
                error={error}
                footer={
                    <>
                        <p className={styles.footerText}>Don't have an account?</p>
                        <Button style={["link"]} label="CREATE ACCOUNT" to="/register" />
                    </>
                }
            >
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

                <Divider size="xlarge">OR</Divider>

                <Button
                    style={["secondary"]}
                    label="CONTINUE WITH GOOGLE"
                    type="button"
                    onClick={handleGoogleLogin}
                />
            </FormWrapper>
        </Layout>
    );
}