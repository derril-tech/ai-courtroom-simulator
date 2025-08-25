'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Gavel, Clock, CheckCircle, XCircle, AlertTriangle, Copy, Download } from 'lucide-react';

interface Ruling {
    id: string;
    motion_id: string;
    motion_kind: string;
    status: 'granted' | 'denied' | 'granted_in_part';
    ruling: string;
    reasoning: string;
    timestamp: string;
    judge_name?: string;
}

interface RulingCardProps {
    ruling: Ruling;
    onCopy?: (ruling: Ruling) => void;
    onDownload?: (ruling: Ruling) => void;
}

export function RulingCard({ ruling, onCopy, onDownload }: RulingCardProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'granted':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'denied':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'granted_in_part':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Clock className="h-5 w-5 text-blue-500" />;
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

    const getMotionTitle = (kind: string) => {
        const titles = {
            'limine': 'Motion in Limine',
            'suppress': 'Motion to Suppress',
            'summary_judgment': 'Motion for Summary Judgment',
            'sever': 'Motion to Sever'
        };
        return titles[kind as keyof typeof titles] || kind;
    };

    const handleCopy = () => {
        const rulingText = `RULING: ${ruling.ruling}\n\nREASONING: ${ruling.reasoning}\n\nDate: ${new Date(ruling.timestamp).toLocaleDateString()}`;
        navigator.clipboard.writeText(rulingText);
        onCopy?.(ruling);
    };

    const handleDownload = () => {
        const rulingText = `COURT RULING\n\nMotion: ${getMotionTitle(ruling.motion_kind)}\nRuling: ${ruling.ruling}\n\nReasoning:\n${ruling.reasoning}\n\nDate: ${new Date(ruling.timestamp).toLocaleDateString()}\nJudge: ${ruling.judge_name || 'The Court'}`;

        const blob = new Blob([rulingText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ruling-${ruling.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        onDownload?.(ruling);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Gavel className="h-6 w-6 text-gray-600" />
                        <div>
                            <CardTitle className="text-lg">{getMotionTitle(ruling.motion_kind)}</CardTitle>
                            <CardDescription>
                                Ruling issued on {new Date(ruling.timestamp).toLocaleDateString()}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(ruling.status)}
                        <Badge className={getStatusColor(ruling.status)}>
                            {ruling.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-lg mb-2">RULING</h4>
                    <p className="text-gray-800 font-medium">{ruling.ruling}</p>
                </div>

                <Separator />

                <div>
                    <h4 className="font-semibold mb-2">REASONING</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ruling.reasoning}
                    </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>Motion ID: {ruling.motion_id}</span>
                        {ruling.judge_name && <span>Judge: {ruling.judge_name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="flex items-center gap-1"
                        >
                            <Copy className="h-3 w-3" />
                            Copy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex items-center gap-1"
                        >
                            <Download className="h-3 w-3" />
                            Download
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Component for displaying multiple rulings
interface RulingsListProps {
    rulings: Ruling[];
    onCopy?: (ruling: Ruling) => void;
    onDownload?: (ruling: Ruling) => void;
}

export function RulingsList({ rulings, onCopy, onDownload }: RulingsListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Court Rulings</h3>
                <Badge variant="outline">{rulings.length} Rulings</Badge>
            </div>

            {rulings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rulings issued yet</p>
                    <p className="text-sm">Rulings will appear here as motions are processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {rulings.map((ruling) => (
                        <RulingCard
                            key={ruling.id}
                            ruling={ruling}
                            onCopy={onCopy}
                            onDownload={onDownload}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
