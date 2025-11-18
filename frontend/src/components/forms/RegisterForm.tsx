import styles from "@/styles/components/forms/RegisterForm.module.css";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";

export default function RegisterForm() {
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

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>USERNAME</label>
                        <Input
                            type="text"
                            placeholder="PlayerOne"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>EMAIL ADDRESS</label>
                        <Input
                            type="email"
                            placeholder="player@algoarcade.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>PASSWORD</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button style={["primary"]} label="CREATE ACCOUNT" />
                </form>

                <div className={styles.footer}>
                    <p className={styles.loginText}>Already have an account?</p>
                    <Button style={["secondary"]} label="LOGIN" to="/login" />
                </div>
            </div>
        </div>
    );
}
