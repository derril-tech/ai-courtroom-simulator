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
    Gavel,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Users,
    FileText,
    Save,
    Send,
    Download,
    Copy,
    Target,
    DollarSign,
    Scale
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface VerdictCount {
    count_number: number;
    count_name: string;
    elements: any[];
    verdict_options: string[];
    special_findings: SpecialFinding[];
}

interface SpecialFinding {
    name: string;
    type: "amount" | "options";
    options?: string[];
    required: boolean;
}

interface VerdictFormProps {
    verdictForm: {
        id: string;
        counts: VerdictCount[];
        special_findings: any[];
        total_verdicts: number;
    };
    onVerdictSubmit: (verdicts: any[]) => void;
    isSubmitted?: boolean;
}

export function VerdictForm({
    verdictForm,
    onVerdictSubmit,
    isSubmitted = false,
}: VerdictFormProps) {
    const [verdicts, setVerdicts] = useState<Record<number, any>>({});
    const [specialFindings, setSpecialFindings] = useState<Record<string, any>>({});
    const [activeTab, setActiveTab] = useState("verdicts");

    const handleVerdictChange = (countNumber: number, verdict: string) => {
        setVerdicts(prev => ({
            ...prev,
            [countNumber]: {
                ...prev[countNumber],
                verdict
            }
        }));
    };

    const handleSpecialFindingChange = (findingKey: string, value: any) => {
        setSpecialFindings(prev => ({
            ...prev,
            [findingKey]: value
        }));
    };

    const handleSubmit = () => {
        const allVerdicts = Object.values(verdicts);
        if (allVerdicts.length === verdictForm.counts.length) {
            onVerdictSubmit(allVerdicts);
        }
    };

    const isFormComplete = () => {
        return Object.keys(verdicts).length === verdictForm.counts.length;
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case "guilty":
            case "for_plaintiff":
                return "bg-red-100 text-red-800 border-red-200";
            case "not_guilty":
            case "for_defendant":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const handleCopyVerdict = () => {
        const verdictText = Object.entries(verdicts)
            .map(([countNum, verdict]) => `Count ${countNum}: ${verdict.verdict}`)
            .join('\n');
        navigator.clipboard.writeText(verdictText);
    };

    const handleDownloadVerdict = () => {
        const verdictText = Object.entries(verdicts)
            .map(([countNum, verdict]) => `Count ${countNum}: ${verdict.verdict}`)
            .join('\n');

        const blob = new Blob([verdictText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verdict-${new Date().toISOString().split('T')[0]}.txt`;
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
                        <Gavel className="h-5 w-5" />
                        Verdict Form
                        {isSubmitted && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Submitted
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyVerdict}
                            disabled={!isFormComplete()}
                        >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadVerdict}
                            disabled={!isFormComplete()}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                        {!isSubmitted && (
                            <Button
                                onClick={handleSubmit}
                                disabled={!isFormComplete()}
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Send className="h-4 w-4" />
                                Submit Verdict
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="verdicts" className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Verdicts
                        </TabsTrigger>
                        <TabsTrigger value="special-findings" className="flex items-center gap-1">
                            <Scale className="h-4 w-4" />
                            Special Findings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="verdicts" className="h-full mt-4">
                        <div className="space-y-4 h-full">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <h3 className="font-medium">Jury Verdicts</h3>
                                <Badge variant="outline">
                                    {Object.keys(verdicts).length} of {verdictForm.counts.length} completed
                                </Badge>
                            </div>

                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {verdictForm.counts.map((count) => (
                                        <div
                                            key={count.count_number}
                                            className="p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <h4 className="font-medium">Count {count.count_number}: {count.count_name}</h4>
                                                {verdicts[count.count_number] && (
                                                    <Badge
                                                        variant="outline"
                                                        className={getVerdictColor(verdicts[count.count_number].verdict)}
                                                    >
                                                        {verdicts[count.count_number].verdict}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Elements */}
                                            {count.elements && count.elements.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Elements:</h5>
                                                    <div className="space-y-1">
                                                        {count.elements.map((element, index) => (
                                                            <div
                                                                key={index}
                                                                className="text-sm text-gray-600 pl-2 border-l-2 border-gray-200"
                                                            >
                                                                {element.name || `Element ${index + 1}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Verdict Options */}
                                            <div className="space-y-3">
                                                <h5 className="text-sm font-medium text-gray-700">Verdict:</h5>
                                                <RadioGroup
                                                    value={verdicts[count.count_number]?.verdict || ""}
                                                    onValueChange={(value) => handleVerdictChange(count.count_number, value)}
                                                    disabled={isSubmitted}
                                                >
                                                    {count.verdict_options.map((option, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <RadioGroupItem value={option} id={`count-${count.count_number}-${index}`} />
                                                            <Label htmlFor={`count-${count.count_number}-${index}`} className="text-sm">
                                                                {option}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>

                                            {/* Special Findings for this count */}
                                            {count.special_findings && count.special_findings.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <h5 className="text-sm font-medium text-gray-700">Special Findings:</h5>
                                                    {count.special_findings.map((finding, index) => (
                                                        <div key={index} className="space-y-2">
                                                            <Label className="text-sm font-medium">{finding.name}:</Label>
                                                            {finding.type === "amount" ? (
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Enter amount"
                                                                        value={specialFindings[`${count.count_number}-${finding.name}`] || ""}
                                                                        onChange={(e) => handleSpecialFindingChange(
                                                                            `${count.count_number}-${finding.name}`,
                                                                            e.target.value
                                                                        )}
                                                                        disabled={isSubmitted}
                                                                        className="w-32"
                                                                    />
                                                                </div>
                                                            ) : finding.type === "options" && finding.options ? (
                                                                <Select
                                                                    value={specialFindings[`${count.count_number}-${finding.name}`] || ""}
                                                                    onValueChange={(value) => handleSpecialFindingChange(
                                                                        `${count.count_number}-${finding.name}`,
                                                                        value
                                                                    )}
                                                                    disabled={isSubmitted}
                                                                >
                                                                    <SelectTrigger className="w-48">
                                                                        <SelectValue placeholder="Select option" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {finding.options.map((option, optIndex) => (
                                                                            <SelectItem key={optIndex} value={option}>
                                                                                {option}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="special-findings" className="h-full mt-4">
                        <div className="space-y-4 h-full">
                            <div className="flex items-center gap-2">
                                <Scale className="h-4 w-4" />
                                <h3 className="font-medium">Special Findings Summary</h3>
                            </div>

                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {Object.entries(specialFindings).map(([key, value]) => {
                                        const [countNum, findingName] = key.split('-');
                                        return (
                                            <div key={key} className="p-3 bg-gray-50 rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-sm">Count {countNum}: {findingName}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {typeof value === 'number' ? 'Amount' : 'Option'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {Object.keys(specialFindings).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No special findings recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
