import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface PlatformLink {
  id?: string;
  pageId?: string;
  platform: string; // spotify, apple_podcasts, apple_music, youtube, youtube_music, amazon_music, iheart, pandora, tidal, soundcloud, deezer, audiomack, player_fm, boomplay, custom
  name: string;
  url: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  clicks?: number;
}

export interface Page {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  campaignType?: string; // podcast, song, album, video, presave, merch, fan_campaign
  brand?: string; // MIND_OVER_MATTER, ASHWIN_GANE, KYYBA_MUSIC
  status?: string; // DRAFT, PUBLISHED, SCHEDULED
  artistName?: string;
  episodeNumber?: string;
  guestName?: string;
  hostName?: string;
  ctaType?: string; // Listen Now, Watch Now, Watch or Listen
  coverImage?: string;
  bgImage?: string;
  releaseDate?: string;
  ctaText?: string;
  customDomain?: string;
  enableFanForm?: boolean;
  fanFormTitle?: string;
  ogImage?: string;
  sections?: Section[];
  isPublished: boolean;
  publishedAt?: string;
  ga4PropertyId?: string;
  ga4MeasurementId?: string;
  ga4StreamId?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  platformLinks?: PlatformLink[];
  linkTrackers?: LinkTracker[];
  project?: { name?: string; metaPixelId?: string };
  _count?: { leads?: number; pageViews?: number };
  pageBgColor?: string;
  pageBgImage?: string;
  fbPixelId?: string;
  googleAdsId?: string;
  gtmId?: string;
  tiktokPixelId?: string;
  snapchatPixelId?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
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

  list(projectId: string, filters?: { brand?: string; campaignType?: string; status?: string }) {
    let url = `${this.base}?projectId=${projectId}`;
    if (filters?.brand) url += `&brand=${encodeURIComponent(filters.brand)}`;
    if (filters?.campaignType) url += `&campaignType=${encodeURIComponent(filters.campaignType)}`;
    if (filters?.status) url += `&status=${encodeURIComponent(filters.status)}`;
    return this.http.get<Page[]>(url);
  }

  get(id: string) {
    return this.http.get<Page>(`${this.base}/${id}`);
  }

  create(data: Partial<Page>) {
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

  trackView(payload: {
    pageId: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  }) {
    return this.http.post(`${environment.apiUrl}/public/track-view`, payload);
  }

  trackClick(payload: {
    pageId: string;
    platformLinkId?: string;
    platform?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  }) {
    return this.http.post(`${environment.apiUrl}/public/track-click`, payload);
  }

  submitLead(payload: {
    pageId: string;
    email: string;
    name?: string;
    phone?: string;
    consent?: boolean;
    platform?: string;
    source?: string;
  }) {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiUrl}/leads`,
      payload
    );
  }
}
