"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Users,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Target,
    BarChart3,
    Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface DeliberationRound {
    round_number: number;
    start_time: string;
    evidence_strength: number;
    consensus_level: number;
    majority_vote: string;
    unanimous: boolean;
    hung_jury: boolean;
    juror_updates: JurorUpdate[];
}

interface JurorUpdate {
    juror_id: string;
    previous_belief: number;
    new_belief: number;
    confidence_change: number;
    influence_received: number;
    influence_given: number;
    vote: string;
}

interface VoteTrajectoryProps {
    deliberationRounds: DeliberationRound[];
    currentRound?: number;
    isLive?: boolean;
    onRoundClick?: (roundNumber: number) => void;
}

export function VoteTrajectory({
    deliberationRounds,
    currentRound,
    isLive = false,
    onRoundClick,
}: VoteTrajectoryProps) {
    const [selectedRound, setSelectedRound] = useState<number | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Prepare chart data from deliberation rounds
        const data = deliberationRounds.map(round => ({
            round: round.round_number,
            consensus: round.consensus_level * 100,
            guiltyVotes: round.juror_updates.filter(u => u.vote === "guilty").length,
            notGuiltyVotes: round.juror_updates.filter(u => u.vote === "not_guilty").length,
            undecidedVotes: round.juror_updates.filter(u => u.vote === "undecided").length,
            evidenceStrength: round.evidence_strength * 100
        }));
        setChartData(data);
    }, [deliberationRounds]);

    const getVoteColor = (vote: string) => {
        switch (vote) {
            case "guilty":
                return "bg-red-100 text-red-800 border-red-200";
            case "not_guilty":
                return "bg-green-100 text-green-800 border-green-200";
            case "undecided":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTrendIcon = (currentConsensus: number, previousConsensus: number) => {
        if (currentConsensus > previousConsensus) {
            return <TrendingUp className="h-4 w-4 text-green-600" />;
        } else if (currentConsensus < previousConsensus) {
            return <TrendingDown className="h-4 w-4 text-red-600" />;
        } else {
            return <Minus className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatDuration = (startTime: string) => {
        const date = new Date(startTime);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const latestRound = deliberationRounds[deliberationRounds.length - 1];
    const totalRounds = deliberationRounds.length;

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Vote Trajectory
                        {isLive && (
                            <Badge variant="destructive" className="animate-pulse">
                                LIVE
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            Round {currentRound || totalRounds}
                        </Badge>
                        <Badge variant="outline">
                            {totalRounds} total
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                {/* Consensus Chart */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <h4 className="text-sm font-medium">Consensus Progress</h4>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="round" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value}%`,
                                        name === "consensus" ? "Consensus" : "Evidence Strength"
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="consensus"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Consensus"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="evidenceStrength"
                                    stroke="#10b981"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    name="Evidence Strength"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vote Distribution Chart */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <h4 className="text-sm font-medium">Vote Distribution</h4>
                    </div>

                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="round" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="guiltyVotes" fill="#ef4444" name="Guilty" />
                                <Bar dataKey="notGuiltyVotes" fill="#22c55e" name="Not Guilty" />
                                <Bar dataKey="undecidedVotes" fill="#eab308" name="Undecided" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latest Round Summary */}
                {latestRound && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <h4 className="text-sm font-medium">Latest Round Summary</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Consensus Level</span>
                                    <Badge variant="outline">
                                        {Math.round(latestRound.consensus_level * 100)}%
                                    </Badge>
                                </div>
                                <Progress value={latestRound.consensus_level * 100} className="h-2" />
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Majority Vote</span>
                                    <Badge
                                        variant="outline"
                                        className={getVoteColor(latestRound.majority_vote)}
                                    >
                                        {latestRound.majority_vote}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {latestRound.unanimous && (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                    )}
                                    {latestRound.hung_jury && (
                                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                    )}
                                    <span>
                                        {latestRound.unanimous ? "Unanimous" :
                                            latestRound.hung_jury ? "Hung Jury" : "Majority"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Round History */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <h4 className="text-sm font-medium">Round History</h4>
                    </div>

                    <ScrollArea className="h-48">
                        <div className="space-y-2">
                            {deliberationRounds.slice().reverse().map((round) => {
                                const previousRound = deliberationRounds[round.round_number - 2];
                                const consensusChange = previousRound
                                    ? round.consensus_level - previousRound.consensus_level
                                    : 0;

                                return (
                                    <div
                                        key={round.round_number}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${selectedRound === round.round_number ? "bg-blue-50 border-blue-200" : ""
                                            }`}
                                        onClick={() => {
                                            setSelectedRound(round.round_number);
                                            onRoundClick?.(round.round_number);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-medium text-sm">Round {round.round_number}</h5>
                                                {getTrendIcon(round.consensus_level, previousRound?.consensus_level || 0)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {Math.round(round.consensus_level * 100)}%
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getVoteColor(round.majority_vote)}`}
                                                >
                                                    {round.majority_vote}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatDuration(round.start_time)}</span>
                                            <div className="flex items-center gap-2">
                                                <span>Evidence: {Math.round(round.evidence_strength * 100)}%</span>
                                                {round.unanimous && (
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                )}
                                                {round.hung_jury && (
                                                    <XCircle className="h-3 w-3 text-red-600" />
                                                )}
                                            </div>
                                        </div>

                                        {Math.abs(consensusChange) > 0.01 && (
                                            <div className="mt-2 text-xs">
                                                <span className={consensusChange > 0 ? "text-green-600" : "text-red-600"}>
                                                    {consensusChange > 0 ? "+" : ""}{Math.round(consensusChange * 100)}% consensus change
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
