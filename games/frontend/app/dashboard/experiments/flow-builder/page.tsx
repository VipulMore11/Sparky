"use client";

import ExperimentBuilder from "@/components/experiments/builder/experiment-builder";
import ExperimentBuilderLite from "@/components/experiments/builder/experiment-builder-lite";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import pb from "@/lib/pb";

export default function FlowBuilderPage() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("id");
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchProjectData() {
            if (!projectId) return;

            setLoading(true);
            try {
                const record = await pb.collection('projects').getOne(projectId);

                if (record && record.data) {
                    let data = record.data;
                    // If data is a string, parse it as JSON
                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    setProjectData(data);
                }
            } catch (error) {
                console.error('Error fetching project data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjectData();
    }, [projectId]);

    return (
        <div className="w-full h-[calc(100vh-6rem)] min-h-[640px]">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <ExperimentBuilder initialData={projectData?.flowDiagram} experimentName={projectData?.experimentName} />
            )}
        </div>
    );
}