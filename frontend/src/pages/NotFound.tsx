import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import styles from "@/styles/pages/NotFound.module.css";

export default function NotFound() {
    return (
        <Layout noFooter noHeader>
            <div className={styles.container}>
                <h1 className={styles.errorCode}>404</h1>
                <p className={styles.title}>
                    {">"} PATH_NOT_FOUND_
                </p>
                <div className={styles.description}>
                    <p>It seems you've wandered off the graph. This node does not exist in our current traversal tree.</p>
                </div>
                <Button to="/" style={["primary"]}>RETURN TO ORIGIN</Button>
            </div>
        </Layout>
    );
}
