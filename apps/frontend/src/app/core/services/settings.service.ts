import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface TrackingSettings {
  gtmId: string | null;
  ga4MeasurementId: string | null;
  googleAdsId: string | null;
  googleAdsConversionLabel: string | null;
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  snapchatPixelId: string | null;
  googleTagsViaGtm: boolean;
  updatedAt?: string;
}

export interface TrackingStatus {
  connected: Record<"gtm" | "ga4" | "googleAds" | "meta" | "tiktok" | "snapchat", boolean>;
  last24h: { pageViews: number; streamingClicks: { platform: string; count: number }[] };
  recentClicks: { platform: string; device: string | null; clickedAt: string }[];
}

@Injectable({ providedIn: "root" })
export class SettingsService {
  private base = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  getTracking() {
    return this.http.get<TrackingSettings>(`${this.base}/tracking`);
  }

  getTrackingStatus() {
    return this.http.get<TrackingStatus>(`${this.base}/tracking/status`);
  }

  updateTracking(data: Partial<TrackingSettings>) {
    return this.http.put<TrackingSettings>(`${this.base}/tracking`, data);
  }
}
