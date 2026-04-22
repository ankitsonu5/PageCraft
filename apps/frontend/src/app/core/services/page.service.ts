import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface Page {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  sections: Section[];
  isPublished: boolean;
  publishedAt?: string;
  ga4PropertyId?: string;
  ga4MeasurementId?: string;
  ga4StreamId?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  linkTrackers?: LinkTracker[];
  project?: { metaPixelId?: string };
  // Background
  pageBgColor?: string;
  pageBgImage?: string;
  // Pixels
  fbPixelId?: string;
  googleAdsId?: string;
  gtmId?: string;
  tiktokPixelId?: string;
  snapchatPixelId?: string;
  // Legal
  privacyPolicyUrl?: string;
  termsUrl?: string;
  // Affiliate
  appleAffCode?: string;
  amazonAffCode?: string;
  spotifyAffCode?: string;
}

export interface Section {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface LinkTracker {
  id: string;
  pageId: string;
  label: string;
  targetUrl: string;
  slug: string;
  clicks: number;
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class PageService {
  private base = `${environment.apiUrl}/pages`;

  constructor(private http: HttpClient) {}

  list(projectId: string) {
    return this.http.get<Page[]>(`${this.base}?projectId=${projectId}`);
  }

  get(id: string) {
    return this.http.get<Page>(`${this.base}/${id}`);
  }

  create(data: { projectId: string; title: string; slug: string }) {
    return this.http.post<Page>(this.base, data);
  }

  update(id: string, data: Partial<Page>) {
    return this.http.patch<Page>(`${this.base}/${id}`, data);
  }

  publish(id: string) {
    return this.http.post<Page>(`${this.base}/${id}/publish`, {});
  }

  duplicate(id: string) {
    return this.http.post<Page>(`${this.base}/${id}/duplicate`, {});
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  getPublic(slug: string) {
    return this.http.get<Page>(`${environment.apiUrl}/public/pages/${slug}`);
  }
}
