'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, FileText, Gavel, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Motion {
    id: string;
    kind: 'limine' | 'suppress' | 'summary_judgment' | 'sever';
    filed_by: string;
    arguments: string;
    status: 'pending' | 'granted' | 'denied' | 'granted_in_part';
    ruling?: string;
    reasoning?: string;
    created_at: string;
}

interface MotionEditorProps {
    caseId: string;
    motions: Motion[];
    onMotionCreate?: (motion: Partial<Motion>) => void;
    onMotionUpdate?: (motionId: string, updates: Partial<Motion>) => void;
}

export function MotionEditor({ caseId, motions, onMotionCreate, onMotionUpdate }: MotionEditorProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newMotion, setNewMotion] = useState({
        kind: 'limine' as Motion['kind'],
        filed_by: '',
        arguments: '',
    });

    const motionTemplates = {
        limine: {
            title: 'Motion in Limine',
            description: 'Motion to exclude evidence before trial',
            template: `The [Party] moves to exclude the following evidence on the grounds that it is inadmissible:

1. [Describe evidence to be excluded]
2. [Legal basis for exclusion]
3. [Prejudicial effect]

This evidence should be excluded because [explain reasoning].`
        },
        suppress: {
            title: 'Motion to Suppress',
            description: 'Motion to exclude illegally obtained evidence',
            template: `The [Party] moves to suppress evidence obtained in violation of the Fourth Amendment:

1. [Describe the search/seizure]
2. [Explain why it was unconstitutional]
3. [Requested relief]

The evidence was obtained through [describe constitutional violation].`
        },
        summary_judgment: {
            title: 'Motion for Summary Judgment',
            description: 'Motion for judgment as a matter of law',
            template: `The [Party] moves for summary judgment on the grounds that there are no genuine issues of material fact:

1. [State the legal standard]
2. [Show no disputed facts exist]
3. [Request judgment as a matter of law]

No reasonable jury could find for the opposing party because [explain].`
        },
        sever: {
            title: 'Motion to Sever',
            description: 'Motion to separate charges or parties',
            template: `The [Party] moves to sever [charges/parties] on the grounds that joinder is prejudicial:

1. [Describe what should be severed]
2. [Explain prejudice from joinder]
3. [Request separate trials]

Severance is necessary because [explain prejudice].`
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'granted':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'denied':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'granted_in_part':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'granted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'denied':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'granted_in_part':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const handleCreateMotion = async () => {
        setIsLoading(true);
        try {
            await onMotionCreate?.(newMotion);
            setNewMotion({ kind: 'limine', filed_by: '', arguments: '' });
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error('Error creating motion:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTemplateSelect = (kind: Motion['kind']) => {
        setNewMotion(prev => ({
            ...prev,
            kind,
            arguments: motionTemplates[kind].template
        }));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Pre-trial Motions
                                <Badge variant="outline">{motions.length} Motions</Badge>
                            </CardTitle>
                            <CardDescription>
                                File and manage pre-trial motions with automatic Judge rulings
                            </CardDescription>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    File Motion
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>File New Motion</DialogTitle>
                                    <DialogDescription>
                                        Create a new pre-trial motion with arguments
                                    </DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="details" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="details">Motion Details</TabsTrigger>
                                        <TabsTrigger value="templates">Templates</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="motion-kind">Motion Type</Label>
                                                <Select value={newMotion.kind} onValueChange={(value: Motion['kind']) => setNewMotion(prev => ({ ...prev, kind: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="limine">Motion in Limine</SelectItem>
                                                        <SelectItem value="suppress">Motion to Suppress</SelectItem>
                                                        <SelectItem value="summary_judgment">Motion for Summary Judgment</SelectItem>
                                                        <SelectItem value="sever">Motion to Sever</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="filed-by">Filed By</Label>
                                                <Input
                                                    id="filed-by"
                                                    value={newMotion.filed_by}
                                                    onChange={(e) => setNewMotion(prev => ({ ...prev, filed_by: e.target.value }))}
                                                    placeholder="e.g., Defense Counsel"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="arguments">Arguments</Label>
                                            <Textarea
                                                id="arguments"
                                                value={newMotion.arguments}
                                                onChange={(e) => setNewMotion(prev => ({ ...prev, arguments: e.target.value }))}
                                                placeholder="Enter motion arguments..."
                                                rows={12}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="templates" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(motionTemplates).map(([key, template]) => (
                                                <Card key={key} className="cursor-pointer hover:bg-gray-50" onClick={() => handleTemplateSelect(key as Motion['kind'])}>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-lg">{template.title}</CardTitle>
                                                        <CardDescription>{template.description}</CardDescription>
                                                    </CardHeader>
                                                </Card>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex gap-2">
                                    <Button onClick={handleCreateMotion} disabled={isLoading || !newMotion.filed_by || !newMotion.arguments}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Filing Motion...
                                            </>
                                        ) : (
                                            'File Motion'
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {motions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No motions filed yet</p>
                                <p className="text-sm">File a motion to begin pre-trial proceedings</p>
                            </div>
                        ) : (
                            motions.map((motion) => (
                                <div
                                    key={motion.id}
                                    className={`border rounded-lg p-4 ${getStatusColor(motion.status)}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Gavel className="h-4 w-4" />
                                            <div>
                                                <h3 className="font-semibold">{motionTemplates[motion.kind].title}</h3>
                                                <p className="text-sm opacity-75">Filed by {motion.filed_by}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(motion.status)}
                                            <Badge variant="outline">{motion.status.replace('_', ' ')}</Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <Label className="text-sm font-medium">Arguments</Label>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{motion.arguments}</p>
                                    </div>

                                    {motion.ruling && (
                                        <div className="mb-3">
                                            <Label className="text-sm font-medium">Ruling</Label>
                                            <p className="text-sm mt-1 font-semibold">{motion.ruling}</p>
                                        </div>
                                    )}

                                    {motion.reasoning && (
                                        <div>
                                            <Label className="text-sm font-medium">Reasoning</Label>
                                            <p className="text-sm mt-1">{motion.reasoning}</p>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500 mt-3">
                                        Filed: {new Date(motion.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
