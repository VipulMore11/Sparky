"use client"

import React, { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Badge } from "@/components/ui/badge"
import { ModuleType } from "./types"

interface GameNodeProps extends NodeProps {
    data: {
        label: string
        type: ModuleType
        color?: string
        gameType?: string
        hasBranching?: boolean
    }
}

const typeIcons: Record<ModuleType, React.ReactNode> = {
    game: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 4H7C4.79086 4 3 5.79086 3 8V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V8C21 5.79086 19.2091 4 17 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 9V11M12 7H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="10" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
        </svg>
    ),
    logic: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V7M12 21V17M3 12H7M21 12H17M18.364 5.636L15.536 8.464M18.364 18.364L15.536 15.536M5.636 5.636L8.464 8.464M5.636 18.364L8.464 15.536" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    task: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    advanced: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4779 19.5791 14.0986 20.1443 14.1 20.77V21C14.1 22.1046 13.2046 23 12.1 23C10.9954 23 10.1 22.1046 10.1 21V20.91C10.0903 20.272 9.69144 19.7022 9.07 19.45C8.45292 19.1777 7.73225 19.3083 7.25 19.78L7.19 19.84C6.81486 20.2156 6.30577 20.4266 5.775 20.4266C5.24423 20.4266 4.73514 20.2156 4.36 19.84C3.98443 19.4649 3.77337 18.9558 3.77337 18.425C3.77337 17.8942 3.98443 17.3851 4.36 17.01L4.42 16.95C4.89171 16.4678 5.02231 15.7471 4.75 15.13C4.49089 14.5279 3.92566 14.1486 3.3 14.15H3C1.89543 14.15 1 13.2546 1 12.15C1 11.0454 1.89543 10.15 3 10.15H3.09C3.72797 10.1403 4.29784 9.74144 4.55 9.12C4.82231 8.50292 4.69171 7.78225 4.22 7.3L4.16 7.24C3.78443 6.86486 3.57337 6.35577 3.57337 5.825C3.57337 5.29423 3.78443 4.78514 4.16 4.41C4.53514 4.03443 5.04423 3.82337 5.575 3.82337C6.10577 3.82337 6.61486 4.03443 6.99 4.41L7.05 4.47C7.53225 4.94171 8.25292 5.07231 8.87 4.8C9.47211 4.54089 9.85144 3.97566 9.85 3.35V3.25C9.85 2.14543 10.7454 1.25 11.85 1.25C12.9546 1.25 13.85 2.14543 13.85 3.25V3.34C13.8486 3.96566 14.2279 4.53089 14.83 4.79C15.4471 5.06231 16.1678 4.93171 16.65 4.46L16.71 4.4C17.0851 4.02443 17.5942 3.81337 18.125 3.81337C18.6558 3.81337 19.1649 4.02443 19.54 4.4C19.9156 4.77514 20.1266 5.28423 20.1266 5.815C20.1266 6.34577 19.9156 6.85486 19.54 7.23L19.48 7.29C19.0083 7.77225 18.8777 8.49292 19.15 9.11V9.11C19.4091 9.71211 19.9743 10.0914 20.6 10.09H20.7C21.8046 10.09 22.7 10.9854 22.7 12.09C22.7 13.1946 21.8046 14.09 20.7 14.09H20.61C19.9822 14.0997 19.4143 14.4903 19.16 15.11V15.11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    end: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    connector: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 11H20M20 11L13 4M20 11L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
}

const GameNode = memo(({ data, id }: GameNodeProps) => {
    const nodeStyle = data.color ? {
        borderColor: data.color,
        borderWidth: '2px',
    } : {};

    // Determine the badge style based on the node type
    const getBadgeVariant = () => {
        if (data.type === 'game') return 'default';
        if (data.type === 'logic') return 'secondary';
        if (data.type === 'end') return 'destructive';
        return 'outline';
    };

    const getBadgeStyle = () => {
        if (data.type === 'game' && data.color) {
            return { backgroundColor: data.color };
        }
        return {};
    };

    return (
        <div
            className="relative rounded-md border border-border bg-card px-4 py-2 shadow-sm"
            style={nodeStyle}
        >
            <Handle type="target" position={Position.Top} className="!bg-primary" />

            <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">
                    {typeIcons[data.type]}
                </span>
                <div>
                    <p className="m-0 font-medium">{data.label}</p>
                    {data.gameType && (
                        <p className="text-xs text-muted-foreground">{data.gameType}</p>
                    )}
                </div>
            </div>

            <div className="mt-2 flex gap-1">
                <Badge
                    variant={getBadgeVariant()}
                    style={getBadgeStyle()}
                    className="text-xs"
                >
                    {data.type}
                </Badge>

                {data.hasBranching && (
                    <Badge variant="outline" className="text-xs">
                        Branching
                    </Badge>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-primary" />
        </div>
    )
})

GameNode.displayName = "GameNode"

export default GameNode