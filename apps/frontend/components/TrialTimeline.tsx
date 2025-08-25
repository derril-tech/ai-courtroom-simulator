"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, FileText, Gavel, CheckCircle, Circle } from "lucide-react";

interface TrialPhase {
    id: string;
    name: string;
    status: "pending" | "active" | "completed";
    duration?: string;
    startTime?: string;
    endTime?: string;
    participants?: string[];
    turns?: number;
    objections?: number;
}

interface TrialTimelineProps {
    phases: TrialPhase[];
    currentPhase: string;
    totalDuration?: string;
    onPhaseClick?: (phaseId: string) => void;
}

export function TrialTimeline({
    phases,
    currentPhase,
    totalDuration,
    onPhaseClick,
}: TrialTimelineProps) {
    const getPhaseIcon = (phase: TrialPhase) => {
        switch (phase.name.toLowerCase()) {
            case "openings":
                return <FileText className="h-4 w-4" />;
            case "witness examination":
                return <Users className="h-4 w-4" />;
            case "closings":
                return <FileText className="h-4 w-4" />;
            case "instructions":
                return <Gavel className="h-4 w-4" />;
            case "deliberation":
                return <Clock className="h-4 w-4" />;
            case "verdict":
                return <Gavel className="h-4 w-4" />;
            case "sentencing":
                return <Gavel className="h-4 w-4" />;
            default:
                return <Circle className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "active":
                return <Circle className="h-4 w-4 text-blue-500 fill-current" />;
            case "pending":
                return <Circle className="h-4 w-4 text-gray-300" />;
            default:
                return <Circle className="h-4 w-4 text-gray-300" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "active":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "pending":
                return "bg-gray-100 text-gray-600 border-gray-200";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const completedPhases = phases.filter((p) => p.status === "completed").length;
    const progressPercentage = (completedPhases / phases.length) * 100;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Trial Timeline
                    {totalDuration && (
                        <Badge variant="secondary" className="ml-auto">
                            {totalDuration}
                        </Badge>
                    )}
                </CardTitle>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{completedPhases} of {phases.length} phases</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {phases.map((phase, index) => (
                        <div
                            key={phase.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${phase.status === "active"
                                    ? "bg-blue-50 border-blue-200"
                                    : "hover:bg-gray-50"
                                }`}
                            onClick={() => onPhaseClick?.(phase.id)}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(phase.status)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        {getPhaseIcon(phase)}
                                        <h4 className="font-medium text-sm">{phase.name}</h4>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${getStatusColor(phase.status)}`}
                                    >
                                        {phase.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {phase.duration && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {phase.duration}
                                        </span>
                                    )}
                                    {phase.turns && (
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {phase.turns} turns
                                        </span>
                                    )}
                                    {phase.objections && (
                                        <span className="flex items-center gap-1">
                                            <Gavel className="h-3 w-3" />
                                            {phase.objections} objections
                                        </span>
                                    )}
                                </div>

                                {phase.participants && phase.participants.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                            <Users className="h-3 w-3" />
                                            Participants:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {phase.participants.map((participant, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {participant}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
