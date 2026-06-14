"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CreateGamesPage = () => {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pattern Matching Game Creator</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            Build pattern matching experiments — configure stimuli, timing,
                            feedback and trials to evaluate pattern recognition and memory.
                        </p>
                        <div className="flex items-center gap-2">
                            <Link href="/experiments/create-games/pattern-matching-builder">
                                <Button>Open Creator</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Game Builder</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            A visual drag-and-drop builder for assembling game components,
                            branching logic, and randomized trials for richer experiments.
                        </p>
                        <div className="flex items-center gap-2">
                            <Link href="/experiments/create-games/konva-test">
                                <Button>Open Builder</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateGamesPage;