"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/app/components/Sidebar";

function MainLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/landing/login");
            return;
        }

        setReady(true);
    }, [router]);

    if (!ready) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}

export default MainLayout;