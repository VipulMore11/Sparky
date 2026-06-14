"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GameCreatorRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the game creator test page
        router.push("/experiments/konva-test");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Redirecting...</h2>
                <p className="text-gray-500">Taking you to the Konva test page.</p>
            </div>
        </div>
    );
}