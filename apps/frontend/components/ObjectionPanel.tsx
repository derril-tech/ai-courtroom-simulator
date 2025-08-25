"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Gavel,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Keyboard,
    Lightbulb,
    History
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ObjectionSuggestion {
    id: string;
    ground: string;
    description: string;
    confidence: number;
    pattern_matched: string;
}

interface Objection {
    id: string;
    ground: string;
    objecting_party: string;
    ruling?: "sustained" | "overruled";
    ruling_text?: string;
    explanation?: string;
    created_at: string;
    turn_id: string;
}

interface ObjectionPanelProps {
    currentTurn?: {
        id: string;
        text: string;
        speaker: string;
        phase: string;
    };
    suggestions?: ObjectionSuggestion[];
    objections: Objection[];
    onObjectionSubmit: (objection: {
        ground: string;
        objecting_party: string;
        turn_id: string;
    }) => void;
    onObjectionClick?: (objectionId: string) => void;
}

export function ObjectionPanel({
    currentTurn,
    suggestions = [],
    objections,
    onObjectionSubmit,
    onObjectionClick,
}: ObjectionPanelProps) {
    const [selectedGround, setSelectedGround] = useState<string>("");
    const [objectingParty, setObjectingParty] = useState<string>("defense");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hotkey handlers
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Only handle hotkeys if the user is not typing in an input
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (event.key) {
                case "1":
                case "2":
                case "3":
                    const suggestionIndex = parseInt(event.key) - 1;
                    if (suggestions[suggestionIndex]) {
                        setSelectedGround(suggestions[suggestionIndex].ground);
                    }
                    break;
                case "o":
                case "O":
                    if (selectedGround) {
                        handleSubmitObjection();
                    }
                    break;
                case "Escape":
                    setSelectedGround("");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [selectedGround, suggestions]);

    const handleSubmitObjection = async () => {
        if (!selectedGround || !currentTurn) return;

        setIsSubmitting(true);
        try {
            await onObjectionSubmit({
                ground: selectedGround,
                objecting_party: objectingParty,
                turn_id: currentTurn.id,
            });
            setSelectedGround("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getGroundColor = (ground: string) => {
        const colors = {
            "Hearsay": "bg-red-100 text-red-800 border-red-200",
            "Leading Question": "bg-orange-100 text-orange-800 border-orange-200",
            "Compound Question": "bg-yellow-100 text-yellow-800 border-yellow-200",
            "Argumentative": "bg-purple-100 text-purple-800 border-purple-200",
            "Asked and Answered": "bg-blue-100 text-blue-800 border-blue-200",
            "Relevance": "bg-green-100 text-green-800 border-green-200",
            "Speculation": "bg-indigo-100 text-indigo-800 border-indigo-200",
            "Character Evidence": "bg-pink-100 text-pink-800 border-pink-200",
            "Privilege": "bg-gray-100 text-gray-800 border-gray-200",
            "Best Evidence": "bg-cyan-100 text-cyan-800 border-cyan-200",
        };
        return colors[ground as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const recentObjections = objections.slice(-5).reverse();

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Objections
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Keyboard className="h-4 w-4 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="space-y-1 text-xs">
                                    <p><strong>1-3:</strong> Select suggestion</p>
                                    <p><strong>O:</strong> Submit objection</p>
                                    <p><strong>Esc:</strong> Clear selection</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                {/* Current Turn Context */}
                {currentTurn && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                                {currentTurn.speaker}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {currentTurn.phase.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                            {currentTurn.text}
                        </p>
                    </div>
                )}

                {/* Objection Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            <h4 className="text-sm font-medium">Suggested Objections</h4>
                        </div>
                        <div className="space-y-2">
                            {suggestions.slice(0, 3).map((suggestion, index) => (
                                <div
                                    key={suggestion.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedGround === suggestion.ground
                                            ? "bg-blue-50 border-blue-200"
                                            : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => setSelectedGround(suggestion.ground)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getGroundColor(suggestion.ground)}`}
                                            >
                                                {suggestion.ground}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {Math.round(suggestion.confidence * 100)}%
                                            </Badge>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {index + 1}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">
                                        {suggestion.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Pattern: "{suggestion.pattern_matched}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Manual Objection Form */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">File Objection</h4>

                    <Select value={selectedGround} onValueChange={setSelectedGround}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select objection ground" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hearsay">Hearsay</SelectItem>
                            <SelectItem value="Leading Question">Leading Question</SelectItem>
                            <SelectItem value="Compound Question">Compound Question</SelectItem>
                            <SelectItem value="Argumentative">Argumentative</SelectItem>
                            <SelectItem value="Asked and Answered">Asked and Answered</SelectItem>
                            <SelectItem value="Relevance">Relevance</SelectItem>
                            <SelectItem value="Speculation">Speculation</SelectItem>
                            <SelectItem value="Character Evidence">Character Evidence</SelectItem>
                            <SelectItem value="Privilege">Privilege</SelectItem>
                            <SelectItem value="Best Evidence">Best Evidence</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={objectingParty} onValueChange={setObjectingParty}>
                        <SelectTrigger>
                            <SelectValue placeholder="Objecting party" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="prosecution">Prosecution</SelectItem>
                            <SelectItem value="defense">Defense</SelectItem>
                            <SelectItem value="plaintiff">Plaintiff</SelectItem>
                            <SelectItem value="defendant">Defendant</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleSubmitObjection}
                        disabled={!selectedGround || !currentTurn || isSubmitting}
                        className="w-full"
                    >
                        <Gavel className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit Objection"}
                    </Button>
                </div>

                {/* Recent Objections */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-gray-600" />
                        <h4 className="text-sm font-medium">Recent Objections</h4>
                    </div>
                    <ScrollArea className="h-32">
                        <div className="space-y-2">
                            {recentObjections.map((objection) => (
                                <div
                                    key={objection.id}
                                    className={`p-2 rounded border cursor-pointer hover:bg-gray-50 ${objection.ruling === "sustained"
                                            ? "border-green-200 bg-green-50"
                                            : "border-red-200 bg-red-50"
                                        }`}
                                    onClick={() => onObjectionClick?.(objection.id)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getGroundColor(objection.ground)}`}
                                        >
                                            {objection.ground}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            {objection.ruling === "sustained" ? (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <XCircle className="h-3 w-3 text-red-600" />
                                            )}
                                            <Badge
                                                variant={objection.ruling === "sustained" ? "default" : "destructive"}
                                                className="text-xs"
                                            >
                                                {objection.ruling}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{objection.objecting_party}</span>
                                        <Clock className="h-3 w-3" />
                                        {formatTimestamp(objection.created_at)}
                                    </div>
                                </div>
                            ))}

                            {recentObjections.length === 0 && (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No objections filed yet
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
