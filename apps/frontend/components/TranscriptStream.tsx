"use client";

import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageSquare,
    User,
    Gavel,
    Users,
    FileText,
    Clock,
    Copy,
    Download,
    Search,
    Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Turn {
    id: string;
    speaker: string;
    text: string;
    timestamp: string;
    phase: string;
    witness_id?: string;
    count_id?: string;
    meta?: Record<string, any>;
    objections?: Objection[];
    exhibits_referenced?: string[];
}

interface Objection {
    id: string;
    ground: string;
    ruling: "sustained" | "overruled";
    ruling_text: string;
}

interface TranscriptStreamProps {
    turns: Turn[];
    currentSpeaker?: string;
    isLive?: boolean;
    onTurnClick?: (turnId: string) => void;
    onObjectionClick?: (objectionId: string) => void;
    onExhibitClick?: (exhibitId: string) => void;
}

export function TranscriptStream({
    turns,
    currentSpeaker,
    isLive = false,
    onTurnClick,
    onObjectionClick,
    onExhibitClick,
}: TranscriptStreamProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [speakerFilter, setSpeakerFilter] = React.useState<string>("all");
    const [phaseFilter, setPhaseFilter] = React.useState<string>("all");

    // Auto-scroll to bottom when new turns are added
    useEffect(() => {
        if (scrollAreaRef.current && isLive) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [turns, isLive]);

    const getSpeakerIcon = (speaker: string) => {
        switch (speaker.toLowerCase()) {
            case "judge":
                return <Gavel className="h-4 w-4" />;
            case "prosecutor":
            case "plaintiff":
                return <User className="h-4 w-4" />;
            case "defense":
            case "defendant":
                return <User className="h-4 w-4" />;
            case "witness":
                return <Users className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getSpeakerColor = (speaker: string) => {
        switch (speaker.toLowerCase()) {
            case "judge":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "prosecutor":
            case "plaintiff":
                return "bg-red-100 text-red-800 border-red-200";
            case "defense":
            case "defendant":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "witness":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const filteredTurns = turns.filter(turn => {
        const matchesSearch = searchTerm === "" ||
            turn.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            turn.speaker.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpeaker = speakerFilter === "all" ||
            turn.speaker.toLowerCase() === speakerFilter.toLowerCase();

        const matchesPhase = phaseFilter === "all" ||
            turn.phase.toLowerCase() === phaseFilter.toLowerCase();

        return matchesSearch && matchesSpeaker && matchesPhase;
    });

    const speakers = Array.from(new Set(turns.map(t => t.speaker)));
    const phases = Array.from(new Set(turns.map(t => t.phase)));

    const handleCopyTranscript = () => {
        const transcriptText = turns
            .map(turn => `${turn.speaker}: ${turn.text}`)
            .join('\n\n');
        navigator.clipboard.writeText(transcriptText);
    };

    const handleDownloadTranscript = () => {
        const transcriptText = turns
            .map(turn => `${turn.speaker}: ${turn.text}`)
            .join('\n\n');

        const blob = new Blob([transcriptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Trial Transcript
                        {isLive && (
                            <Badge variant="destructive" className="animate-pulse">
                                LIVE
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyTranscript}
                        >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadTranscript}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search transcript..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select value={speakerFilter} onValueChange={setSpeakerFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Speaker" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Speakers</SelectItem>
                            {speakers.map(speaker => (
                                <SelectItem key={speaker} value={speaker.toLowerCase()}>
                                    {speaker}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Phase" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Phases</SelectItem>
                            {phases.map(phase => (
                                <SelectItem key={phase} value={phase.toLowerCase()}>
                                    {phase.replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
                    <div className="space-y-4 pb-4">
                        {filteredTurns.map((turn) => (
                            <div
                                key={turn.id}
                                className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${currentSpeaker === turn.speaker ? "bg-blue-50 border-blue-200" : ""
                                    }`}
                                onClick={() => onTurnClick?.(turn.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getSpeakerIcon(turn.speaker)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getSpeakerColor(turn.speaker)}`}
                                            >
                                                {turn.speaker}
                                            </Badge>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTimestamp(turn.timestamp)}
                                            </span>
                                            {turn.phase && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {turn.phase.replace('_', ' ')}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {turn.text}
                                        </p>

                                        {/* Objections */}
                                        {turn.objections && turn.objections.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {turn.objections.map((objection) => (
                                                    <div
                                                        key={objection.id}
                                                        className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs cursor-pointer hover:bg-yellow-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onObjectionClick?.(objection.id);
                                                        }}
                                                    >
                                                        <Gavel className="h-3 w-3 text-yellow-600" />
                                                        <span className="font-medium">{objection.ground}</span>
                                                        <Badge
                                                            variant={objection.ruling === "sustained" ? "destructive" : "default"}
                                                            className="text-xs"
                                                        >
                                                            {objection.ruling}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Exhibits Referenced */}
                                        {turn.exhibits_referenced && turn.exhibits_referenced.length > 0 && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <FileText className="h-3 w-3" />
                                                    Exhibits:
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {turn.exhibits_referenced.map((exhibitId) => (
                                                        <Badge
                                                            key={exhibitId}
                                                            variant="outline"
                                                            className="text-xs cursor-pointer hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onExhibitClick?.(exhibitId);
                                                            }}
                                                        >
                                                            {exhibitId}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredTurns.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No transcript entries found</p>
                                {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
