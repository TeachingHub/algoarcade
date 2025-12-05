import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import styles from "@/styles/pages/games/TSP.module.css";

export default function TSP() {
  return (
    <Layout>
        <div className={styles.gameContainer}>
            {/* Header del Juego */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>TRAVELING SALESPERSON</h1>
                    <div className={styles.badges}>
                        <span className={styles.badge}>HARD</span>
                        <span className={styles.badge}>GRAPH</span>
                    </div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statBox}>
                        <span className={styles.statLabel}>BEST</span>
                        <span className={styles.statValue}>--</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statLabel}>CURRENT</span>
                        <span className={styles.statValue}>0</span>
                    </div>
                </div>
            </div>

            {/* Área Principal */}
            <div className={styles.content}>
                <div className={styles.canvasArea}>
                    {/* Aquí renderizaremos el canvas más adelante */}
                    <div className={styles.placeholder}>
                        GAME CANVAS
                    </div>
                </div>

                {/* Sidebar de Controles */}
                <div className={styles.sidebar}>
                    <div className={styles.controlPanel}>
                        <h3>CONTROLS</h3>
                        <div className={styles.actions}>
                            <Button style={["primary"]} label="START" onClick={() => {}} />
                            <Button style={["secondary"]} label="RESET" onClick={() => {}} />
                        </div>
                    </div>
                    
                    <div className={styles.controlPanel}>
                        <h3>SETTINGS</h3>
                        {/* Aquí irán los sliders de configuración */}
                        <div className={styles.setting}>
                            <label>Cities</label>
                            <input type="range" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
  );
}