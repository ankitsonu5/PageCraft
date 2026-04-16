import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface FanLead {
  id: string;
  email: string;
  name?: string;
  platform?: string;
  source?: string;
  city?: string;
  country?: string;
  device?: string;
  segment: string;
  klaviyoSynced: boolean;
  capturedAt: string;
  page?: { title: string; slug: string };
}

export interface LeadsSummary {
  total: number;
  synced: number;
  byPlatform: { platform: string; _count: number }[];
  byCountry: { country: string; _count: number }[];
}

@Injectable({ providedIn: "root" })
export class LeadsService {
  private base = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(
    projectId: string,
    filters: { platform?: string; segment?: string } = {},
  ) {
    const params: Record<string, string> = { projectId };
    if (filters.platform) params["platform"] = filters.platform;
    if (filters.segment) params["segment"] = filters.segment;
    return this.http.get<{ leads: FanLead[]; total: number }>(
      `${this.base}/manage`,
      { params },
    );
  }

  getSummary(projectId: string) {
    return this.http.get<LeadsSummary>(`${this.base}/manage/summary`, {
      params: { projectId },
    });
  }

  submit(payload: {
    pageId: string;
    email: string;
    name?: string;
    platform?: string;
    source?: string;
  }) {
    return this.http.post<{ success: boolean }>(`${this.base}`, payload);
  }
}
