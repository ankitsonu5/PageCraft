import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { Section } from "../../../../core/services/page.service";

@Component({
  selector: "app-section-renderer",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./section-renderer.component.html",
})
export class SectionRendererComponent {
  @Input() section!: Section;
  @Input() pageId = "";
  @Input() affiliateCodes: {
    apple?: string;
    amazon?: string;
    spotify?: string;
  } = {};
  @Output() selectField = new EventEmitter<string>();

  onElementClick(event: MouseEvent, fieldName: string) {
    event.preventDefault();
    event.stopPropagation();
    this.selectField.emit(fieldName);
  }

  // Fan gate state
  fanEmail = signal("");
  fanName = signal("");
  fanSubmitting = signal(false);
  fanSuccess = signal(false);
  fanError = signal("");

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) {}

  submitFanGate() {
    if (!this.pageId || !this.fanEmail()) return;
    this.fanSubmitting.set(true);
    this.fanError.set("");
    const payload: Record<string, string> = {
      pageId: this.pageId,
      email: this.fanEmail(),
      source: "fan-gate",
    };
    if (this.fanName()) payload["name"] = this.fanName();
    if (this.d["platform"]) payload["platform"] = this.d["platform"] as string;

    this.http.post("/api/leads", payload).subscribe({
      next: () => {
        this.fanSuccess.set(true);
        this.fanSubmitting.set(false);
      },
      error: () => {
        this.fanError.set("Something went wrong. Please try again.");
        this.fanSubmitting.set(false);
      },
    });
  }

  get d(): Record<string, any> {
    return this.section.data as Record<string, any>;
  }

  starArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  get openItems(): Set<number> {
    return this._open;
  }

  private _open = new Set<number>();

  toggleFaq(i: number) {
    this._open.has(i) ? this._open.delete(i) : this._open.add(i);
  }

  getSafeSrcdoc(): SafeHtml {
    const html = (this.d["html"] as string) || "";
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ─── Video Embed ───────────────────────────────────
  getVideoEmbedUrl(): SafeResourceUrl | null {
    const raw = ((this.d["url"] as string) || "").trim();
    if (!raw) return null;

    // YouTube: watch, short URL, shorts
    let m = raw.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    if (m) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`,
      );
    }

    // Vimeo
    m = raw.match(/vimeo\.com\/(\d+)/);
    if (m) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://player.vimeo.com/video/${m[1]}?color=ffffff&title=0&byline=0`,
      );
    }

    return null;
  }

  get videoAspectPadding(): string {
    const ratio = (this.d["aspectRatio"] as string) || "16:9";
    const [w, h] = ratio.split(":").map(Number);
    return `${((h / w) * 100).toFixed(4)}%`;
  }

  // ─── Smart Link ────────────────────────────────────
  readonly platformMeta: Record<
    string,
    { bg: string; color: string; icon: string }
  > = {
    spotify: { bg: "#1DB954", color: "#fff", icon: "spotify" },
    apple: { bg: "#fc3c44", color: "#fff", icon: "apple" },
    apple_podcasts: { bg: "#872ec4", color: "#fff", icon: "apple_podcasts" },
    youtube: { bg: "#FF0000", color: "#fff", icon: "youtube" },
    amazon: { bg: "#FF9900", color: "#fff", icon: "amazon" },
    amazon_music: { bg: "#25d1da", color: "#0f172a", icon: "amazon_music" },
    iheart: { bg: "#c60000", color: "#fff", icon: "iheart" },
    player_fm: { bg: "#c22227", color: "#fff", icon: "player_fm" },
    boomplay: { bg: "#e60000", color: "#fff", icon: "boomplay" },
    custom: { bg: "#4f46e5", color: "#fff", icon: "custom" },
    rss: { bg: "#f26522", color: "#fff", icon: "rss" },
    jiosaavn: { bg: "#00C4B3", color: "#fff", icon: "saavn" },
    gaana: { bg: "#E72C30", color: "#fff", icon: "gaana" },
    deezer: { bg: "#A238FF", color: "#fff", icon: "deezer" },
    soundcloud: { bg: "#FF5500", color: "#fff", icon: "sc" },
    tidal: { bg: "#232323", color: "#fff", icon: "tidal" },
  };

  get activeLinks(): any[] {
    const links = (this.d["links"] as any[]) || [];
    return links.filter((l) => l.active !== false);
  }

  trackPlatformClick(link: any) {
    if (!this.pageId) return;
    this.http
      .post("/api/public/track-click", {
        pageId: this.pageId,
        platformLinkId: link.id || null,
        platform: link.platform || link.label || "custom",
      })
      .subscribe({ error: () => {} });
  }

  platformBg(platform: string): string {
    return this.platformMeta[platform]?.bg ?? "#333";
  }

  platformColor(platform: string): string {
    return this.platformMeta[platform]?.color ?? "#fff";
  }

  getPlatformIconSvg(platform: string, customIcon?: string): SafeHtml {
    const svgs: Record<string, string> = {
      spotify: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.341c-.217.357-.682.469-1.039.252-2.846-1.739-6.429-2.132-10.648-1.168-.403.093-.812-.162-.905-.565-.093-.403.162-.812.565-.905 4.622-1.056 8.577-.611 11.776 1.347.357.217.469.682.251 1.039zm1.474-3.277c-.273.444-.858.587-1.302.314-3.256-2.001-8.222-2.583-12.074-1.413-.501.152-1.028-.132-1.18-.633-.152-.501.132-1.028.633-1.18 4.417-1.34 9.892-.689 13.609 1.597.444.274.587.859.314 1.302zm.126-3.411c-3.905-2.319-10.347-2.533-14.108-1.392-.6.182-1.237-.163-1.419-.763-.182-.6.163-1.237.763-1.419 4.316-1.31 11.428-1.051 15.932 1.623.539.32.716 1.02.396 1.559-.32.538-1.02.716-1.564.392z"/></svg>`,
      apple: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.98.04-2.19.66-2.88 1.47-.62.73-1.16 1.9-1.01 3.02 1.1.09 2.23-.57 2.9-1.39z"/></svg>`,
      apple_podcasts: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3.25a3.75 3.75 0 013.75 3.75c0 1.348-.715 2.528-1.785 3.183v.817a.75.75 0 01-.75.75h-2.43a.75.75 0 01-.75-.75v-.817A3.75 3.75 0 018.25 9 3.75 3.75 0 0112 5.25zM10.5 19.5v-2h3v2h-3zm-3.5-3.5v-1.5h10v1.5H7z"/></svg>`,
      youtube: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
      amazon: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.7 17.5c-3.8 0-6.7-1.5-8.5-3.5-.3-.3-.1-.8.3-.7 4.2 1.3 8.3.4 10.9-.9.4-.2.8.2.5.6-1 1.6-1.9 4.5-3.2 4.5zm2.8-5.3c-.2.3-.6.4-.9.2-1.3-.9-3.2-1.3-5.2-1.3-2.1 0-4.2.5-5.6 1.4-.3.2-.8.1-1-.2-.2-.3-.1-.8.2-1 1.6-1.1 3.9-1.6 6.4-1.6 2.3 0 4.4.5 5.9 1.5.3.2.4.7.2 1z"/></svg>`,
      amazon_music: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.7 17.5c-3.8 0-6.7-1.5-8.5-3.5-.3-.3-.1-.8.3-.7 4.2 1.3 8.3.4 10.9-.9.4-.2.8.2.5.6-1 1.6-1.9 4.5-3.2 4.5zm2.8-5.3c-.2.3-.6.4-.9.2-1.3-.9-3.2-1.3-5.2-1.3-2.1 0-4.2.5-5.6 1.4-.3.2-.8.1-1-.2-.2-.3-.1-.8.2-1 1.6-1.1 3.9-1.6 6.4-1.6 2.3 0 4.4.5 5.9 1.5.3.2.4.7.2 1z"/></svg>`,
      iheart: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
      player_fm: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`,
      boomplay: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l7 4.5-7 4.5z"/></svg>`,
      jiosaavn: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`,
      gaana: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`,
      soundcloud: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M11.56 8.87V17h8.56c1.6 0 2.88-1.28 2.88-2.88 0-1.53-1.19-2.77-2.7-2.87-.29-2.22-2.18-3.95-4.48-3.95-1.74 0-3.26.97-4.04 2.42-.07-.06-.15-.12-.22-.17zM1 13.5C1 15.43 2.57 17 4.5 17H10V10H4.5C2.57 10 1 11.57 1 13.5z"/></svg>`,
      deezer: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M18 16h5v3h-5zm0-4h5v3h-5zm0-4h5v3h-5zm-6 8h5v3h-5zm0-4h5v3h-5zm-6 4h5v3H6zm-6 0h5v3H0z"/></svg>`,
      tidal: `<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 6L8 2 4 6l4 4 4-4zm-8 8l-4-4 4-4 4 4-4 4zm16 0l-4-4 4-4 4 4-4 4zm-8 0l-4-4 4-4 4 4-4 4z"/></svg>`,
    };

    if (svgs[platform]) {
      return this.sanitizer.bypassSecurityTrustHtml(svgs[platform]);
    }
    if (customIcon) {
      return this.sanitizer.bypassSecurityTrustHtml(`<span class="text-lg flex-shrink-0">${customIcon}</span>`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`);
  }

  /** Append affiliate/tracking params to platform URLs when codes are set. */
  getAffiliateUrl(platform: string, url: string): string {
    if (!url) return url;
    try {
      const u = new URL(url);
      if (platform === "spotify" && this.affiliateCodes.spotify) {
        u.searchParams.set("si", this.affiliateCodes.spotify);
      } else if (platform === "apple" && this.affiliateCodes.apple) {
        u.searchParams.set("at", this.affiliateCodes.apple);
      } else if (platform === "amazon" && this.affiliateCodes.amazon) {
        u.searchParams.set("tag", this.affiliateCodes.amazon);
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  // ─── Footer Social ─────────────────────────────────
  private readonly socialMeta: Record<string, { bg: string; initial: string }> =
    {
      instagram: { bg: "#E1306C", initial: "In" },
      facebook: { bg: "#1877F2", initial: "Fb" },
      youtube: { bg: "#FF0000", initial: "Yt" },
      twitter: { bg: "#1DA1F2", initial: "Tw" },
      x: { bg: "#000000", initial: "𝕏" },
      linkedin: { bg: "#0A66C2", initial: "Li" },
      whatsapp: { bg: "#25D366", initial: "Wa" },
      snapchat: { bg: "#FFFC00", initial: "Sc" },
    };

  socialBg(platform: string): string {
    return this.socialMeta[platform]?.bg ?? "#555";
  }

  socialInitial(platform: string): string {
    return this.socialMeta[platform]?.initial ?? platform.slice(0, 2);
  }
}
