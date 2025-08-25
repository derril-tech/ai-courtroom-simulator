'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Image, File, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';

interface Exhibit {
    id: string;
    code: string;
    title: string;
    description?: string;
    type: string;
    status: 'pending' | 'admitted' | 'denied';
    foundation_requirements?: string[];
    metadata?: any;
}

interface ExhibitManagerProps {
    exhibits: Exhibit[];
    onExhibitUpdate?: (exhibitId: string, updates: Partial<Exhibit>) => void;
    onFoundationComplete?: (exhibitId: string, requirements: string[]) => void;
}

export function ExhibitManager({ exhibits, onExhibitUpdate, onFoundationComplete }: ExhibitManagerProps) {
    const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'admitted':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'denied':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'admitted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'denied':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const handleFoundationToggle = (requirement: string) => {
        if (!selectedExhibit) return;

        const currentRequirements = selectedExhibit.foundation_requirements || [];
        const updatedRequirements = currentRequirements.includes(requirement)
            ? currentRequirements.filter(r => r !== requirement)
            : [...currentRequirements, requirement];

        onFoundationComplete?.(selectedExhibit.id, updatedRequirements);
    };

    const handleStatusChange = (exhibitId: string, status: 'admitted' | 'denied') => {
        onExhibitUpdate?.(exhibitId, { status });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Exhibit Manager
                        <Badge variant="outline">{exhibits.length} Exhibits</Badge>
                    </CardTitle>
                    <CardDescription>
                        Manage exhibits, foundation requirements, and admissibility
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {exhibits.map((exhibit) => (
                            <div
                                key={exhibit.id}
                                className={`border rounded-lg p-4 ${getStatusColor(exhibit.status)}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getFileIcon(exhibit.type)}
                                        <div>
                                            <h3 className="font-semibold">{exhibit.code}</h3>
                                            <p className="text-sm opacity-75">{exhibit.title}</p>
                                        </div>
                                    </div>
                                    {getStatusIcon(exhibit.status)}
                                </div>

                                {exhibit.description && (
                                    <p className="text-sm mb-3">{exhibit.description}</p>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary">{exhibit.type}</Badge>
                                    <Badge variant="outline">{exhibit.status}</Badge>
                                </div>

                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedExhibit(exhibit)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Exhibit Details: {exhibit.code}</DialogTitle>
                                                <DialogDescription>
                                                    Review exhibit information and foundation requirements
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Title</Label>
                                                    <p className="text-sm">{exhibit.title}</p>
                                                </div>

                                                {exhibit.description && (
                                                    <div>
                                                        <Label>Description</Label>
                                                        <p className="text-sm">{exhibit.description}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <Label>Type</Label>
                                                    <p className="text-sm">{exhibit.type}</p>
                                                </div>

                                                {exhibit.metadata && (
                                                    <div>
                                                        <Label>Metadata</Label>
                                                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                                            {JSON.stringify(exhibit.metadata, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}

                                                {exhibit.foundation_requirements && (
                                                    <div>
                                                        <Label>Foundation Requirements</Label>
                                                        <div className="space-y-2 mt-2">
                                                            {exhibit.foundation_requirements.map((requirement) => (
                                                                <div key={requirement} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`foundation-${exhibit.id}-${requirement}`}
                                                                        checked={true}
                                                                        onCheckedChange={() => handleFoundationToggle(requirement)}
                                                                    />
                                                                    <Label htmlFor={`foundation-${exhibit.id}-${requirement}`} className="text-sm">
                                                                        {requirement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleStatusChange(exhibit.id, 'admitted')}
                                                        disabled={exhibit.status === 'admitted'}
                                                    >
                                                        Admit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleStatusChange(exhibit.id, 'denied')}
                                                        disabled={exhibit.status === 'denied'}
                                                    >
                                                        Deny
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedExhibit(exhibit);
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Exhibit: {selectedExhibit?.code}</DialogTitle>
                        <DialogDescription>
                            Update exhibit information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedExhibit && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="exhibit-title">Title</Label>
                                <Input
                                    id="exhibit-title"
                                    value={selectedExhibit.title}
                                    onChange={(e) => onExhibitUpdate?.(selectedExhibit.id, { title: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="exhibit-description">Description</Label>
                                <Textarea
                                    id="exhibit-description"
                                    value={selectedExhibit.description || ''}
                                    onChange={(e) => onExhibitUpdate?.(selectedExhibit.id, { description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => setIsEditDialogOpen(false)}>
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
