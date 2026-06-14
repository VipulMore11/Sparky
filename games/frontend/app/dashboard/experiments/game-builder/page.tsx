"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GameBuilderPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/experiments/create-games");
    }, [router]);

    return (
        <div className="w-full h-[calc(100vh-6rem)] min-h-[640px] flex items-center justify-center">
            <p>Redirecting to Game Creator...</p>
        </div>
    );
}