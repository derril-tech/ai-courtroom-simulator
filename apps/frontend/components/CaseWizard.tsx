'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileText, Image, File } from 'lucide-react';

interface CaseWizardProps {
    onComplete: (caseData: any) => void;
}

export function CaseWizard({ onComplete }: CaseWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [caseData, setCaseData] = useState({
        title: '',
        jurisdiction: '',
        caseType: 'criminal',
        summary: '',
        exhibits: [] as any[],
    });

    const handleInputChange = (field: string, value: string) => {
        setCaseData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newExhibits = Array.from(files).map((file, index) => ({
                id: `exhibit-${Date.now()}-${index}`,
                name: file.name,
                type: file.type,
                size: file.size,
                file,
                status: 'pending'
            }));

            setCaseData(prev => ({
                ...prev,
                exhibits: [...prev.exhibits, ...newExhibits]
            }));
        }
    };

    const removeExhibit = (exhibitId: string) => {
        setCaseData(prev => ({
            ...prev,
            exhibits: prev.exhibits.filter(ex => ex.id !== exhibitId)
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // TODO: Call API to create case and normalize intake
            const response = await fetch('/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(caseData),
            });

            if (response.ok) {
                const result = await response.json();
                onComplete(result);
            }
        } catch (error) {
            console.error('Error creating case:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Case</CardTitle>
                    <CardDescription>
                        Set up a new mock trial case with all necessary details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="1">Basic Info</TabsTrigger>
                            <TabsTrigger value="2">Case Details</TabsTrigger>
                            <TabsTrigger value="3">Exhibits</TabsTrigger>
                            <TabsTrigger value="4">Review</TabsTrigger>
                        </TabsList>

                        <TabsContent value="1" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Case Title</Label>
                                    <Input
                                        id="title"
                                        value={caseData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., State v. Smith"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                                    <Input
                                        id="jurisdiction"
                                        value={caseData.jurisdiction}
                                        onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                                        placeholder="e.g., California"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caseType">Case Type</Label>
                                <Select value={caseData.caseType} onValueChange={(value) => handleInputChange('caseType', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="criminal">Criminal</SelectItem>
                                        <SelectItem value="civil">Civil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setCurrentStep(2)} disabled={!caseData.title}>
                                Next: Case Details
                            </Button>
                        </TabsContent>

                        <TabsContent value="2" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="summary">Case Summary</Label>
                                <Textarea
                                    id="summary"
                                    value={caseData.summary}
                                    onChange={(e) => handleInputChange('summary', e.target.value)}
                                    placeholder="Provide a detailed summary of the case, including key facts, parties involved, and timeline of events..."
                                    rows={8}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                    Back
                                </Button>
                                <Button onClick={() => setCurrentStep(3)} disabled={!caseData.summary}>
                                    Next: Exhibits
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="3" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Upload Exhibits</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Drag and drop files here, or click to select
                                    </p>
                                    <Input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                                        Select Files
                                    </Button>
                                </div>
                            </div>

                            {caseData.exhibits.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Uploaded Exhibits</Label>
                                    <div className="space-y-2">
                                        {caseData.exhibits.map((exhibit) => (
                                            <div key={exhibit.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(exhibit.type)}
                                                    <span className="font-medium">{exhibit.name}</span>
                                                    <Badge variant="secondary">{exhibit.type}</Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeExhibit(exhibit.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                    Back
                                </Button>
                                <Button onClick={() => setCurrentStep(4)}>
                                    Next: Review
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="4" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Case Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Title:</span> {caseData.title}
                                        </div>
                                        <div>
                                            <span className="font-medium">Jurisdiction:</span> {caseData.jurisdiction}
                                        </div>
                                        <div>
                                            <span className="font-medium">Type:</span> {caseData.caseType}
                                        </div>
                                        <div>
                                            <span className="font-medium">Exhibits:</span> {caseData.exhibits.length}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Summary</h3>
                                    <p className="text-sm text-gray-600">{caseData.summary}</p>
                                </div>

                                {caseData.exhibits.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Exhibits</h3>
                                        <div className="space-y-1">
                                            {caseData.exhibits.map((exhibit) => (
                                                <div key={exhibit.id} className="flex items-center gap-2 text-sm">
                                                    {getFileIcon(exhibit.type)}
                                                    <span>{exhibit.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Case...
                                        </>
                                    ) : (
                                        'Create Case'
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
