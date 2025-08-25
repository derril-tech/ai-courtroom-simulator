// Created automatically by Cursor AI (2024-01-01)

import axios, { AxiosInstance } from 'axios';
import { Case, Count, Witness, Exhibit, Turn, Objection, Verdict } from './types';

export class CourtroomSimulatorAPI {
    private client: AxiosInstance;

    constructor(baseURL: string = 'http://localhost:3001', token?: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
    }

    // Cases
    async createCase(data: Partial<Case>): Promise<Case> {
        const response = await this.client.post('/cases', data);
        return response.data;
    }

    async getCase(id: string): Promise<Case> {
        const response = await this.client.get(`/cases/${id}`);
        return response.data;
    }

    async listCases(): Promise<Case[]> {
        const response = await this.client.get('/cases');
        return response.data;
    }

    // Counts
    async createCount(caseId: string, data: Partial<Count>): Promise<Count> {
        const response = await this.client.post(`/cases/${caseId}/counts`, data);
        return response.data;
    }

    async getCounts(caseId: string): Promise<Count[]> {
        const response = await this.client.get(`/cases/${caseId}/counts`);
        return response.data;
    }

    // Witnesses
    async createWitness(caseId: string, data: Partial<Witness>): Promise<Witness> {
        const response = await this.client.post(`/cases/${caseId}/witnesses`, data);
        return response.data;
    }

    async getWitnesses(caseId: string): Promise<Witness[]> {
        const response = await this.client.get(`/cases/${caseId}/witnesses`);
        return response.data;
    }

    // Exhibits
    async createExhibit(caseId: string, data: Partial<Exhibit>): Promise<Exhibit> {
        const response = await this.client.post(`/cases/${caseId}/exhibits`, data);
        return response.data;
    }

    async getExhibits(caseId: string): Promise<Exhibit[]> {
        const response = await this.client.get(`/cases/${caseId}/exhibits`);
        return response.data;
    }

    // Trial
    async startTrial(caseId: string): Promise<void> {
        await this.client.post(`/cases/${caseId}/trial/start`);
    }

    async addTurn(caseId: string, data: Partial<Turn>): Promise<Turn> {
        const response = await this.client.post(`/cases/${caseId}/turns`, data);
        return response.data;
    }

    async getTurns(caseId: string): Promise<Turn[]> {
        const response = await this.client.get(`/cases/${caseId}/turns`);
        return response.data;
    }

    // Objections
    async raiseObjection(caseId: string, data: Partial<Objection>): Promise<Objection> {
        const response = await this.client.post(`/cases/${caseId}/objections`, data);
        return response.data;
    }

    async getObjections(caseId: string): Promise<Objection[]> {
        const response = await this.client.get(`/cases/${caseId}/objections`);
        return response.data;
    }

    // Verdicts
    async createVerdict(caseId: string, data: Partial<Verdict>): Promise<Verdict> {
        const response = await this.client.post(`/cases/${caseId}/verdicts`, data);
        return response.data;
    }

    async getVerdict(caseId: string): Promise<Verdict> {
        const response = await this.client.get(`/cases/${caseId}/verdicts`);
        return response.data;
    }
}
