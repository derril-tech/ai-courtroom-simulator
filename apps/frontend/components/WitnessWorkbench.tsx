"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    User,
    FileText,
    Clock,
    Play,
    Pause,
    Square,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Gavel,
    BookOpen,
    Target
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Witness {
    id: string;
    name: string;
    role: string;
    status: "pending" | "sworn" | "examining" | "completed";
    testimony?: string;
    examination_mode?: "direct" | "cross" | "redirect" | "recross";
    start_time?: string;
    end_time?: string;
    objections?: number;
    exhibits_used?: string[];
}

interface WitnessWorkbenchProps {
    witnesses: Witness[];
    currentWitness?: Witness;
    onWitnessSelect: (witnessId: string) => void;
    onExaminationStart: (witnessId: string, mode: string) => void;
    onExaminationEnd: (witnessId: string) => void;
    onTestimonyAdd: (witnessId: string, testimony: string) => void;
}

export function WitnessWorkbench({
    witnesses,
    currentWitness,
    onWitnessSelect,
    onExaminationStart,
    onExaminationEnd,
    onTestimonyAdd,
}: WitnessWorkbenchProps) {
    const [newTestimony, setNewTestimony] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [examinationMode, setExaminationMode] = useState<string>("direct");

    const handleStartExamination = () => {
        if (currentWitness) {
            onExaminationStart(currentWitness.id, examinationMode);
        }
    };

    const handleEndExamination = () => {
        if (currentWitness) {
            onExaminationEnd(currentWitness.id);
        }
    };

    const handleAddTestimony = () => {
        if (currentWitness && newTestimony.trim()) {
            onTestimonyAdd(currentWitness.id, newTestimony.trim());
            setNewTestimony("");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "examining":
                return <Play className="h-4 w-4 text-blue-500" />;
            case "sworn":
                return <User className="h-4 w-4 text-yellow-500" />;
            case "pending":
                return <Clock className="h-4 w-4 text-gray-400" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "examining":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "sworn":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "pending":
                return "bg-gray-100 text-gray-600 border-gray-200";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const getExaminationModeColor = (mode: string) => {
        switch (mode) {
            case "direct":
                return "bg-green-100 text-green-800 border-green-200";
            case "cross":
                return "bg-red-100 text-red-800 border-red-200";
            case "redirect":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "recross":
                return "bg-purple-100 text-purple-800 border-purple-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatDuration = (startTime?: string, endTime?: string) => {
        if (!startTime) return "";

        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
    };

    const pendingWitnesses = witnesses.filter(w => w.status === "pending");
    const completedWitnesses = witnesses.filter(w => w.status === "completed");

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Witness Workbench
                    {currentWitness && (
                        <Badge variant="outline" className="ml-auto">
                            {currentWitness.name}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    {/* Witness List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Witnesses</h4>
                        <ScrollArea className="h-64">
                            <div className="space-y-2">
                                {witnesses.map((witness) => (
                                    <div
                                        key={witness.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentWitness?.id === witness.id
                                                ? "bg-blue-50 border-blue-200"
                                                : "hover:bg-gray-50"
                                            }`}
                                        onClick={() => onWitnessSelect(witness.id)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(witness.status)}
                                            <h5 className="font-medium text-sm">{witness.name}</h5>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getStatusColor(witness.status)}`}
                                            >
                                                {witness.status}
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-gray-600 mb-2">{witness.role}</p>

                                        {witness.examination_mode && (
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getExaminationModeColor(witness.examination_mode)}`}
                                            >
                                                {witness.examination_mode}
                                            </Badge>
                                        )}

                                        {witness.objections && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Gavel className="h-3 w-3" />
                                                {witness.objections} objections
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Current Witness Details */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Current Witness</h4>

                        {currentWitness ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-medium">{currentWitness.name}</h5>
                                        <Badge
                                            variant="outline"
                                            className={getStatusColor(currentWitness.status)}
                                        >
                                            {currentWitness.status}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2">{currentWitness.role}</p>

                                    {currentWitness.examination_mode && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant="outline"
                                                className={getExaminationModeColor(currentWitness.examination_mode)}
                                            >
                                                {currentWitness.examination_mode} examination
                                            </Badge>
                                            {currentWitness.start_time && (
                                                <span className="text-xs text-gray-500">
                                                    {formatDuration(currentWitness.start_time, currentWitness.end_time)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {currentWitness.exhibits_used && currentWitness.exhibits_used.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FileText className="h-3 w-3" />
                                                Exhibits used:
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {currentWitness.exhibits_used.map((exhibitId) => (
                                                    <Badge key={exhibitId} variant="secondary" className="text-xs">
                                                        {exhibitId}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Examination Controls */}
                                {currentWitness.status === "sworn" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Select value={examinationMode} onValueChange={setExaminationMode}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Examination mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="direct">Direct</SelectItem>
                                                    <SelectItem value="cross">Cross</SelectItem>
                                                    <SelectItem value="redirect">Redirect</SelectItem>
                                                    <SelectItem value="recross">Recross</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                onClick={handleStartExamination}
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <Play className="h-3 w-3" />
                                                Start
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentWitness.status === "examining" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => setIsRecording(!isRecording)}
                                                variant={isRecording ? "destructive" : "default"}
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                {isRecording ? <Pause className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                                                {isRecording ? "Stop" : "Record"}
                                            </Button>

                                            <Button
                                                onClick={() => setIsMuted(!isMuted)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                                {isMuted ? "Unmute" : "Mute"}
                                            </Button>

                                            <Button
                                                onClick={handleEndExamination}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <Square className="h-3 w-3" />
                                                End
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Testimony Input */}
                                {currentWitness.status === "examining" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <h5 className="text-sm font-medium">Add Testimony</h5>
                                        </div>
                                        <Textarea
                                            placeholder="Enter testimony..."
                                            value={newTestimony}
                                            onChange={(e) => setNewTestimony(e.target.value)}
                                            className="min-h-[80px]"
                                        />
                                        <Button
                                            onClick={handleAddTestimony}
                                            disabled={!newTestimony.trim()}
                                            size="sm"
                                            className="w-full"
                                        >
                                            Add Testimony
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Select a witness to begin</p>
                            </div>
                        )}
                    </div>

                    {/* Testimony History */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Testimony History</h4>

                        {currentWitness ? (
                            <ScrollArea className="h-64">
                                <div className="space-y-2">
                                    {currentWitness.testimony ? (
                                        <div className="p-3 bg-blue-50 rounded-lg border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium">Testimony</span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {currentWitness.testimony}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            No testimony recorded yet
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Select a witness to view testimony</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{pendingWitnesses.length}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {witnesses.filter(w => w.status === "examining").length}
                        </div>
                        <div className="text-xs text-gray-500">Examining</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{completedWitnesses.length}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
