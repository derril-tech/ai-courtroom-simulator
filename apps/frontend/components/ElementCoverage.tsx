'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Element {
    name: string;
    count_id: string;
    status: 'unmet' | 'covered' | 'contested';
    description: string;
}

interface Count {
    label: string;
    elements: Element[];
}

interface ElementCoverageProps {
    counts: Count[];
    onElementClick?: (element: Element) => void;
}

export function ElementCoverage({ counts, onElementClick }: ElementCoverageProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'covered':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'contested':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'unmet':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'covered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'contested':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'unmet':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const calculateCoverage = (count: Count) => {
        const total = count.elements.length;
        const covered = count.elements.filter(el => el.status === 'covered').length;
        const contested = count.elements.filter(el => el.status === 'contested').length;

        return {
            total,
            covered,
            contested,
            percentage: total > 0 ? Math.round((covered / total) * 100) : 0
        };
    };

    const overallCoverage = () => {
        const allElements = counts.flatMap(count => count.elements);
        const total = allElements.length;
        const covered = allElements.filter(el => el.status === 'covered').length;

        return total > 0 ? Math.round((covered / total) * 100) : 0;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Element Coverage Matrix
                        <Badge variant="outline">{overallCoverage()}% Complete</Badge>
                    </CardTitle>
                    <CardDescription>
                        Track which elements of each count have been established through evidence
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {counts.map((count) => {
                            const coverage = calculateCoverage(count);

                            return (
                                <div key={count.label} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">{count.label}</h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {coverage.covered}/{coverage.total} Covered
                                            </Badge>
                                            <Progress value={coverage.percentage} className="w-24" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {count.elements.map((element) => (
                                            <div
                                                key={element.name}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${getStatusColor(element.status)}`}
                                                onClick={() => onElementClick?.(element)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(element.status)}
                                                    <span className="font-medium text-sm">
                                                        {element.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1 opacity-75">
                                                    {element.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Coverage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {counts.flatMap(c => c.elements).filter(el => el.status === 'covered').length}
                            </div>
                            <div className="text-sm text-gray-600">Covered</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {counts.flatMap(c => c.elements).filter(el => el.status === 'contested').length}
                            </div>
                            <div className="text-sm text-gray-600">Contested</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">
                                {counts.flatMap(c => c.elements).filter(el => el.status === 'unmet').length}
                            </div>
                            <div className="text-sm text-gray-600">Unmet</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
