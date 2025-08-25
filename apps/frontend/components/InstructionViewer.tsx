"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    FileText,
    CheckCircle,
    Clock,
    Eye,
    Download,
    Copy,
    Send,
    AlertTriangle,
    Gavel,
    Users,
    Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InstructionSection {
    id: string;
    title: string;
    content: string;
    order: number;
}

interface VerdictForm {
    id: string;
    counts: VerdictCount[];
    special_findings: any[];
    total_verdicts: number;
}

interface VerdictCount {
    count_number: number;
    count_name: string;
    elements: any[];
    verdict_options: string[];
    special_findings: any[];
}

interface InstructionViewerProps {
    instructions: {
        id: string;
        case_id: string;
        generated_at: string;
        sections: InstructionSection[];
        custom_instructions: any[];
        verdict_form: VerdictForm;
    };
    isPublished?: boolean;
    onPublish?: (instructionId: string) => void;
    onCustomInstructionAdd?: (instruction: string) => void;
}

export function InstructionViewer({
    instructions,
    isPublished = false,
    onPublish,
    onCustomInstructionAdd,
}: InstructionViewerProps) {
    const [activeTab, setActiveTab] = useState("instructions");
    const [customInstruction, setCustomInstruction] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const sortedSections = instructions.sections.sort((a, b) => a.order - b.order);

    const filteredSections = sortedSections.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePublish = () => {
        if (onPublish) {
            onPublish(instructions.id);
        }
    };

    const handleAddCustomInstruction = () => {
        if (customInstruction.trim() && onCustomInstructionAdd) {
            onCustomInstructionAdd(customInstruction.trim());
            setCustomInstruction("");
        }
    };

    const handleCopyInstructions = () => {
        const instructionText = sortedSections
            .map(section => `${section.title}\n\n${section.content}`)
            .join('\n\n');
        navigator.clipboard.writeText(instructionText);
    };

    const handleDownloadInstructions = () => {
        const instructionText = sortedSections
            .map(section => `${section.title}\n\n${section.content}`)
            .join('\n\n');

        const blob = new Blob([instructionText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jury-instructions-${new Date().toISOString().split('T')[0]}.txt`;
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
                        <BookOpen className="h-5 w-5" />
                        Jury Instructions
                        {isPublished && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Published
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {!isPublished && onPublish && (
                            <Button
                                onClick={handlePublish}
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Send className="h-4 w-4" />
                                Publish
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyInstructions}
                        >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadInstructions}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="instructions" className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Instructions
                        </TabsTrigger>
                        <TabsTrigger value="verdict-form" className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Verdict Form
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="flex items-center gap-1">
                            <Gavel className="h-4 w-4" />
                            Custom
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="instructions" className="h-full mt-4">
                        <div className="space-y-4 h-full">
                            {/* Search */}
                            <div className="relative">
                                <Input
                                    placeholder="Search instructions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                                <FileText className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>

                            {/* Instructions List */}
                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {filteredSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-medium text-sm">{section.title}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    Order {section.order}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {section.content}
                                            </p>
                                        </div>
                                    ))}

                                    {filteredSections.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No instructions found</p>
                                            {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Summary */}
                            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                                <span>{filteredSections.length} of {sortedSections.length} sections</span>
                                <span>Generated {new Date(instructions.generated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="verdict-form" className="h-full mt-4">
                        <div className="space-y-4 h-full">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                <h3 className="font-medium">Verdict Form</h3>
                                <Badge variant="outline">
                                    {instructions.verdict_form.total_verdicts} counts
                                </Badge>
                            </div>

                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {instructions.verdict_form.counts.map((count) => (
                                        <div
                                            key={count.count_number}
                                            className="p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <h4 className="font-medium">Count {count.count_number}: {count.count_name}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {count.verdict_options.length} options
                                                </Badge>
                                            </div>

                                            {/* Verdict Options */}
                                            <div className="space-y-2 mb-3">
                                                <h5 className="text-sm font-medium text-gray-700">Verdict Options:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {count.verdict_options.map((option, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {option}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Elements */}
                                            {count.elements && count.elements.length > 0 && (
                                                <div className="space-y-2 mb-3">
                                                    <h5 className="text-sm font-medium text-gray-700">Elements:</h5>
                                                    <div className="space-y-1">
                                                        {count.elements.map((element, index) => (
                                                            <div
                                                                key={index}
                                                                className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200"
                                                            >
                                                                {element.name || `Element ${index + 1}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Special Findings */}
                                            {count.special_findings && count.special_findings.length > 0 && (
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-medium text-gray-700">Special Findings:</h5>
                                                    <div className="space-y-1">
                                                        {count.special_findings.map((finding, index) => (
                                                            <div
                                                                key={index}
                                                                className="text-xs text-gray-600 pl-2 border-l-2 border-blue-200"
                                                            >
                                                                {finding.name}
                                                                {finding.options && (
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {finding.options.map((option, optIndex) => (
                                                                            <Badge
                                                                                key={optIndex}
                                                                                variant="outline"
                                                                                className="text-xs"
                                                                            >
                                                                                {option}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="custom" className="h-full mt-4">
                        <div className="space-y-4 h-full">
                            <div className="flex items-center gap-2">
                                <Gavel className="h-5 w-5" />
                                <h3 className="font-medium">Custom Instructions</h3>
                            </div>

                            {/* Add Custom Instruction */}
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Enter custom jury instruction..."
                                    value={customInstruction}
                                    onChange={(e) => setCustomInstruction(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <Button
                                    onClick={handleAddCustomInstruction}
                                    disabled={!customInstruction.trim()}
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <Gavel className="h-4 w-4" />
                                    Add Instruction
                                </Button>
                            </div>

                            {/* Custom Instructions List */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Added Custom Instructions:</h4>
                                <ScrollArea className="h-64">
                                    <div className="space-y-2">
                                        {instructions.custom_instructions.map((instruction, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-blue-50 border border-blue-200 rounded text-sm"
                                            >
                                                {instruction}
                                            </div>
                                        ))}

                                        {instructions.custom_instructions.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Gavel className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No custom instructions added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
