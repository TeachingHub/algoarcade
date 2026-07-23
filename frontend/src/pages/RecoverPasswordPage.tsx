import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/layouts/Layout";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/forms/Form.module.css";
import { recoverPassword } from "@/services/authService";


export default function RecoverPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await recoverPassword(email);
            setSuccessMessage("Password reset email sent. Please check your inbox and your spam folder.");
        } catch (err: any) {
            setError("Failed to send email.");
            console.error(err);
        }
    };



    return (
        <Layout>
            <FormWrapper
                title="RECOVER PASSWORD"
                subtitle={<>You will recive an email<br />to recover your password</>}
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

                <Button style={["primary"]} label="Send Email" type="submit" />

                <p className={styles.footerText}>{successMessage}</p>

            </FormWrapper>
        </Layout>
    );
}