"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NewFeaturesBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="w-full bg-primary/10 border-b p-3 flex items-center justify-between">
            <div>
                <h3 className="font-medium text-sm">New Animation Features:</h3>
                <p className="text-xs text-muted-foreground">
                    Added position controls, hover effects, and 6 new animation types including path animations!
                    Try "Center X/Y" buttons, hover effects, and animations like Scale, Shake, and Path Movement.
                </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
                <span className="text-xs">Got it</span>
            </Button>
        </div>
    );
}