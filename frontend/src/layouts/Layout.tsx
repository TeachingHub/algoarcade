import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import styles from "@styles/layouts/Layout.module.css";

import type { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>
                {children}
            </main>
            <Footer />
        </div>
    );
}