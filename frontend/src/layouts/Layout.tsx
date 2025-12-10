import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import styles from "@styles/layouts/Layout.module.css";

import type { ReactNode } from "react";

interface LayoutProps {
    noHeader?: boolean;
    noFooter?: boolean;
    children: ReactNode;
}

export default function Layout({ children, noHeader, noFooter }: LayoutProps) {
    
    return (
        <div className={styles.layout}>
            {!noHeader && <Header />}
            <main className={styles.main}>
                {children}
            </main>
            {!noFooter && <Footer />}
        </div>
    );
}