import styles from "@/styles/components/forms/LoginForm.module.css";
import Button from "@/components/shared/Button";

export default function LoginForm() {
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

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>EMAIL ADDRESS</label>
                        <input 
                            type="email" 
                            className={styles.input}
                            placeholder="player@algoarcade.com"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>PASSWORD</label>
                        <input 
                            type="password" 
                            className={styles.input}
                            placeholder="••••••••"
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

                    <Button style={["primary"]} label="LOGIN" />
                </form>

                <div className={styles.footer}>
                    <p className={styles.signupText}>Don't have an account?</p>
                    <Button style={["secondary"]} label="CREATE ACCOUNT" />
                </div>

                <div className={styles.backToHome}>
                    <a href="/" className={styles.backLink}>Back to Home</a>
                </div>
            </div>
        </div>
    );
}