import { Component, Input, signal } from "@angular/core";
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
    youtube: { bg: "#FF0000", color: "#fff", icon: "youtube" },
    amazon: { bg: "#FF9900", color: "#fff", icon: "amazon" },
    jiosaavn: { bg: "#00C4B3", color: "#fff", icon: "saavn" },
    gaana: { bg: "#E72C30", color: "#fff", icon: "gaana" },
    deezer: { bg: "#A238FF", color: "#fff", icon: "deezer" },
    soundcloud: { bg: "#FF5500", color: "#fff", icon: "sc" },
    tidal: { bg: "#232323", color: "#fff", icon: "tidal" },
  };

  get activeLinks(): any[] {
    const links = (this.d["links"] as any[]) || [];
    return links.filter((l) => l.active && l.url);
  }

  platformBg(platform: string): string {
    return this.platformMeta[platform]?.bg ?? "#333";
  }

  platformColor(platform: string): string {
    return this.platformMeta[platform]?.color ?? "#fff";
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
