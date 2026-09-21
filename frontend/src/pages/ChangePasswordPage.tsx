import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/layouts/Layout";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/forms/Form.module.css";


export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();
    const { changePassword } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("NEW PASSWORD and CONFIRM PASSWORD are different")
            setSuccessMessage("");
            return;
        }
        try {
            await changePassword(currentPassword, newPassword);
            setSuccessMessage("Password changed successfully.");
            await new Promise((resolve) => setTimeout(resolve, 3000));
            navigate("/profile");
        } catch (err: any) {
            if (err.message === "GoogleUserChangePassword") {
                setError("This is a Google account. You can't change the password because this account does not have an associated password.");
            } else {
                setError("Failed to change password.");
            }
            setSuccessMessage("");
            console.error(err);
        }
    };



    return (
        <Layout>
            <FormWrapper
                title="CHANGE PASSWORD"
                onSubmit={handleSubmit}
                error={error}
            >
                <div className={styles.inputGroup}>
                    <label className={styles.label}>CURRENT PASSWORD</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                    <label className={styles.label}>NEW PASSWORD</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <label className={styles.label}>CONFIRM PASSWORD</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <Button style={["primary"]} label="Change Password" type="submit" />

                <p className={styles.footerText}>{successMessage}</p>

            </FormWrapper>
        </Layout>
    );
}