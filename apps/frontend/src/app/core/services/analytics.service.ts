import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface AnalyticsData {
  page: {
    id: string;
    title: string;
    projectId: string;
    ga4PropertyId?: string;
    ga4MeasurementId?: string;
    fbPixelId?: string;
    googleAdsId?: string;
    gtmId?: string;
    tiktokPixelId?: string;
    snapchatPixelId?: string;
    appleAffCode?: string;
    amazonAffCode?: string;
    spotifyAffCode?: string;
  };
  ga4Data: {
    summary: { value: string }[];
    timeSeries: {
      dimensionValues: { value: string }[];
      metricValues: { value: string }[];
    }[];
    geo: {
      dimensionValues: { value: string }[];
      metricValues: { value: string }[];
    }[];
    devices: {
      dimensionValues: { value: string }[];
      metricValues: { value: string }[];
    }[];
    gender: {
      dimensionValues: { value: string }[];
      metricValues: { value: string }[];
    }[];
    sources: {
      dimensionValues: { value: string }[];
      metricValues: { value: string }[];
    }[];
  } | null;
  links: LinkStat[];
  leadsCount: number;
}

export interface LinkStat {
  id: string;
  label: string;
  slug: string;
  targetUrl: string;
  totalClicks: number;
  todayClicks: number;
  topCity: string | null;
}

export type Period = "today" | "7d" | "30d" | "90d" | "all";

@Injectable({ providedIn: "root" })
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  get(pageId: string, period: Period = "30d") {
    return this.http.get<AnalyticsData>(
      `${environment.apiUrl}/analytics/${pageId}?period=${period}`,
    );
  }
}
