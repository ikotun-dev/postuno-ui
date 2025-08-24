"use client";

import Sidebar from "@/components/navigation/sidebar";


export default function Layout({ children }: { children: React.ReactNode }) {
    return <Sidebar>{children}</Sidebar>
}