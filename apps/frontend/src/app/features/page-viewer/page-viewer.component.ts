import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  HostListener,
  signal,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { Subscription, switchMap, catchError, of } from "rxjs";
import { PageService, Page } from "../../core/services/page.service";
import {
  TrackingService,
  ReleaseContext,
} from "../../core/services/tracking.service";
import { SectionRendererComponent } from "../builder/components/section-renderer/section-renderer.component";
import { getCleanCampaignUrl } from "../../core/utils/url.util";
import {
  detectStreamingPlatform,
  platformLabel,
} from "../../core/utils/streaming-platform.util";

@Component({
  selector: "app-page-viewer",
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  templateUrl: "./page-viewer.component.html",
})
export class PageViewerComponent implements OnInit, OnDestroy {
  page: Page | null = null;
  loading = true;
  notFound = false;
  consentGiven = signal(false);
  showConsentBanner = signal(false);

  private release: ReleaseContext | null = null;
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private pageService: PageService,
    private tracking: TrackingService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    // paramMap (not snapshot): the component is reused when navigating between
    // two release slugs, and each one must load its own data + page_view.
    this.sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading = true;
          this.notFound = false;
          return this.pageService
            .getPublic(params.get("slug")!)
            .pipe(catchError(() => of(null)));
        }),
      )
      .subscribe((data) => {
        this.loading = false;
        this.page = data;
        if (!data) {
          this.notFound = true;
          this.release = null;
          return;
        }
        if (isPlatformBrowser(this.platformId)) this.onPageLoaded(data);
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private onPageLoaded(data: Page) {
    this.release = this.buildReleaseContext(data);
    this.applySeo(data);
    this.applyPageBackground(data.pageBgColor, data.pageBgImage);
    this.trackView(data.id);

    // Marketing tags: global (AGL settings) + page-level IDs, each loaded once
    if (data.tracking) {
      const stored = this.readConsent();
      this.consentGiven.set(stored === "granted");
      this.tracking.init(data.tracking, { consent: stored === "granted" });
      this.showConsentBanner.set(
        data.tracking.metaPixelIds.length > 0 && !stored,
      );
    }
    // history.state.navigationId is unique per router navigation → one page_view per load
    const navId = (history.state && history.state.navigationId) || 0;
    this.tracking.pageView(this.release, `${data.slug}|${navId}`);
  }

  /** One delegated listener for every streaming link on the page (all section types). */
  @HostListener("click", ["$event"])
  onClick(event: MouseEvent) {
    if (!this.release) return;
    const a = (event.target as HTMLElement | null)?.closest?.("a");
    if (!a || !a.href) return;
    const platform = detectStreamingPlatform(a.href, a.dataset["platform"]);
    if (!platform) return;
    const label = platformLabel(platform, a.dataset["platformLabel"]);
    // First-party click log (powers Analytics + Settings → Tracking Status)
    const q = this.route.snapshot.queryParams;
    this.pageService
      .trackClick({
        pageId: this.page!.id,
        platform: label,
        referrer: document.referrer || undefined,
        utmSource: q["utm_source"] || undefined,
        utmMedium: q["utm_medium"] || undefined,
        utmCampaign: q["utm_campaign"] || undefined,
        utmContent: q["utm_content"] || undefined,
      })
      .subscribe({ error: () => {} });
    this.tracking.streamingClick(this.release, {
      // Display name, e.g. "Spotify"; unknown/future platforms use the button label
      platform: label,
      destination_url: a.href,
      link_text: (a.innerText || "").trim().slice(0, 100),
    });
  }

  acceptConsent() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.writeConsent("granted");
    this.consentGiven.set(true);
    this.showConsentBanner.set(false);
    this.tracking.grantConsent();
  }

  declineConsent() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.writeConsent("denied");
    this.showConsentBanner.set(false);
  }

  private readConsent(): string | null {
    try {
      return localStorage.getItem("pc_consent");
    } catch {
      return null;
    }
  }

  private writeConsent(value: string) {
    try {
      localStorage.setItem("pc_consent", value);
    } catch {
      // storage blocked (private mode) — consent applies to this page view only
    }
  }

  private buildReleaseContext(data: Page): ReleaseContext {
    const r = data.seo?.release;
    return {
      page_slug: data.slug,
      artist_name: r?.artistName || data.artistName || "",
      track_name: r?.trackName || data.title,
      release_type: r?.releaseType || data.campaignType || "",
      page_title: data.title,
    };
  }

  private applyPageBackground(bgColor?: string, bgImage?: string) {
    // Wrapper is rendered in the same change-detection pass — wait a tick
    setTimeout(() => {
      const wrapper = document.getElementById("page-viewer-wrapper");
      if (!wrapper) return;
      if (bgColor) {
        // Only allow valid hex/rgb/named colors — strip anything else
        const safe =
          /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([\d,.\s%]+\)|[a-zA-Z]+)$/.test(
            bgColor.trim(),
          );
        if (safe) wrapper.style.backgroundColor = bgColor.trim();
      }
      if (bgImage) {
        // Only allow http/https image URLs — block data: and javascript: URIs
        try {
          const u = new URL(bgImage.trim());
          if (u.protocol === "http:" || u.protocol === "https:") {
            wrapper.style.backgroundImage = `url('${u.href}')`;
            wrapper.style.backgroundSize = "cover";
            wrapper.style.backgroundPosition = "center";
            wrapper.style.backgroundRepeat = "no-repeat";
          }
        } catch {
          // invalid URL — silently skip
        }
      }
    });
  }

  /** Keep head tags in sync on client-side navigation (server renders them on first load). */
  private applySeo(data: Page) {
    const seo = data.seo;
    const url = seo?.url || getCleanCampaignUrl(data.slug, data.customDomain);
    const title = seo?.title || data.metaTitle || data.title;
    document.title = title;

    let link: HTMLLinkElement | null = document.querySelector(
      "link[rel='canonical']",
    );
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);

    const description = seo?.description || data.metaDescription;
    if (description) this.setMetaTag("name", "description", description);
    this.setMetaTag("property", "og:url", url);
    this.setMetaTag("property", "og:title", seo?.ogTitle || title);
    const ogDesc = seo?.ogDescription || description;
    if (ogDesc) this.setMetaTag("property", "og:description", ogDesc);
    const image = seo?.image || data.ogImage;
    if (image) this.setMetaTag("property", "og:image", image);
  }

  private setMetaTag(attrName: string, attrVal: string, content: string) {
    let meta: HTMLMetaElement | null = document.querySelector(
      `meta[${attrName}="${attrVal}"]`,
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attrName, attrVal);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  private trackView(pageId: string) {
    const params = this.route.snapshot.queryParams;
    this.pageService
      .trackView({
        pageId,
        referrer:
          typeof document !== "undefined"
            ? document.referrer || undefined
            : undefined,
        utmSource: params["utm_source"] || undefined,
        utmMedium: params["utm_medium"] || undefined,
        utmCampaign: params["utm_campaign"] || undefined,
        utmContent: params["utm_content"] || undefined,
      })
      .subscribe({ error: () => {} });
  }
}
