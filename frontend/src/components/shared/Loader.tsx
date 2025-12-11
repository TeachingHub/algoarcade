import styles from '@/styles/components/shared/Loader.module.css';

interface LoaderProps {
    fullScreen?: boolean;
}

const Loader = ({ fullScreen = true }: LoaderProps) => {
    return (
        <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
            <div className={styles.spinner}>
                <div className={styles.pixel}></div>
                <div className={styles.pixel}></div>
                <div className={styles.pixel}></div>
                <div className={styles.pixel}></div>
            </div>
            <div className={styles.text}>LOADING...</div>
        </div>
    );
};

export default Loader;
