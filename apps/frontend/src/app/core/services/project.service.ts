import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  logo?: string;
  defaultHeader?: Record<string, unknown> | null;
  defaultFooter?: Record<string, unknown> | null;
  metaPixelId?: string;
  metaCapiToken?: string;
  klaviyoApiKey?: string;
  klaviyoListId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { pages: number };
  pages?: PageSummary[];
}

export interface PageSummary {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string;
  updatedAt: string;
  ga4MeasurementId?: string;
}

@Injectable({ providedIn: "root" })
export class ProjectService {
  private base = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Project[]>(this.base);
  }

  get(id: string) {
    return this.http.get<Project>(`${this.base}/${id}`);
  }

  create(data: Partial<Project>) {
    return this.http.post<Project>(this.base, data);
  }

  update(id: string, data: Partial<Project>) {
    return this.http.patch<Project>(`${this.base}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
