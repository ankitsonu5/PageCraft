import { Injectable } from "@angular/core";

/** Effective tracking config for a page (global settings + page-level IDs), built by the API. */
export interface TrackingConfig {
  gtmIds: string[];
  ga4Ids: string[];
  googleAdsIds: string[];
  googleAdsConversionLabel?: string | null;
  metaPixelIds: string[];
  tiktokPixelIds: string[];
  snapchatPixelIds: string[];
  /** GA4 / Ads are managed inside GTM → do not also load them via gtag.js */
  googleTagsViaGtm: boolean;
  /** GTM already present in the server-rendered HTML */
  serverGtmId?: string | null;
}

/** Release data attached to every event. */
export interface ReleaseContext {
  page_slug: string;
  artist_name: string;
  track_name: string;
  release_type: string;
  page_title: string;
}

export interface StreamingClick {
  platform: string;
  destination_url: string;
  link_text?: string;
}

/**
 * Single owner of all marketing tags on public pages.
 *
 * - Every tag ID is loaded at most once per document (state lives on window,
 *   so it survives Angular component re-creation and route changes).
 * - Events go to the GTM dataLayer AND, unless GA4/Ads are managed in GTM, to
 *   gtag directly — never both paths for the same destination.
 * - page_view is sent manually (send_page_view: false) so SPA route changes
 *   produce exactly one page_view per release page load.
 */
@Injectable({ providedIn: "root" })
export class TrackingService {
  private config: TrackingConfig | null = null;
  private consent = false;

  private get w(): any {
    return window as any;
  }

  private get loaded(): Set<string> {
    const w = this.w;
    return (w.__PC_LOADED_TAGS ||= new Set<string>(
      w.__PC_GTM_ID ? [w.__PC_GTM_ID] : [],
    ));
  }

  private get dataLayer(): any[] {
    return (this.w.dataLayer = this.w.dataLayer || []);
  }

  /** Load all tags for the page. Safe to call repeatedly. */
  init(config: TrackingConfig, opts: { consent: boolean }) {
    this.config = config;
    this.consent = opts.consent;
    if (config.serverGtmId) this.loaded.add(config.serverGtmId);

    config.gtmIds.forEach((id) => this.loadGtm(id));
    if (!config.googleTagsViaGtm) {
      [...config.ga4Ids, ...config.googleAdsIds].forEach((id) =>
        this.loadGoogleTag(id),
      );
    }
    config.tiktokPixelIds.forEach((id) => this.loadTikTok(id));
    config.snapchatPixelIds.forEach((id) => this.loadSnapchat(id));
    if (this.consent) this.loadMetaPixels();
  }

  /** Called after the visitor accepts the consent banner. */
  grantConsent() {
    this.consent = true;
    this.loadMetaPixels();
  }

  /** One page_view per release page load. `key` dedupes repeated calls for the same navigation. */
  pageView(ctx: ReleaseContext, key: string) {
    const sent: Set<string> = (this.w.__PC_PV_SENT ||= new Set<string>());
    if (sent.has(key)) return;
    sent.add(key);

    const params = {
      ...ctx,
      page_location: window.location.href,
      page_path: window.location.pathname,
    };
    this.dataLayer.push({ event: "page_view", ...params });
    // GA4 page_view + Google Ads remarketing in one call
    this.gtagEvent("page_view", params, [
      ...(this.config?.ga4Ids || []),
      ...(this.config?.googleAdsIds || []),
    ]);
    this.metaTrack("PageView");
    if (this.config?.tiktokPixelIds.length && this.w.ttq) this.w.ttq.page();
    if (this.config?.snapchatPixelIds.length && this.w.snaptr)
      this.w.snaptr("track", "PAGE_VIEW");
  }

  streamingClick(ctx: ReleaseContext, click: StreamingClick) {
    const params = { ...ctx, ...click };
    this.dataLayer.push({ event: "streaming_click", ...params });
    this.gtagEvent("streaming_click", params, this.config?.ga4Ids || []);

    const label = this.config?.googleAdsConversionLabel;
    if (label) {
      this.gtagEvent(
        "conversion",
        {},
        (this.config?.googleAdsIds || []).map((id) => `${id}/${label}`),
      );
    }
    this.metaTrack(
      "ViewContent",
      { content_name: ctx.track_name, content_category: click.platform },
      true,
    );
    if (this.w.ttq)
      this.w.ttq.track("ClickButton", {
        content_name: ctx.track_name,
        description: click.platform,
      });
    if (this.w.snaptr)
      this.w.snaptr("track", "CUSTOM_EVENT_1", { description: click.platform });
  }

  // ─── Loaders ──────────────────────────────────────

  private loadGtm(id: string) {
    if (this.loaded.has(id)) return;
    this.loaded.add(id);
    this.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    this.appendScript(
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`,
    );
  }

  private loadGoogleTag(id: string) {
    if (this.loaded.has(id)) return;
    this.loaded.add(id);
    const w = this.w;
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      w.gtag = function () {
        w.dataLayer.push(arguments);
      };
      w.gtag("js", new Date());
    }
    if (!document.getElementById("gtag-js")) {
      this.appendScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
        "gtag-js",
      );
    }
    // page_view is sent manually per release page load (see pageView)
    w.gtag("config", id, { send_page_view: false });
  }

  private loadMetaPixels() {
    const ids = this.config?.metaPixelIds || [];
    if (!ids.length) return;
    const w = this.w;
    if (!w.fbq) {
      const n: any = (w.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      });
      if (!w._fbq) w._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      this.appendScript("https://connect.facebook.net/en_US/fbevents.js");
    }
    ids.forEach((id) => {
      const key = `fb:${id}`;
      if (this.loaded.has(key)) return;
      this.loaded.add(key);
      w.fbq("init", id);
    });
    // PageView for the current page is sent by pageView(); if consent arrives
    // after it, send it now.
    if (w.__PC_PV_SENT?.size && !w.__PC_FB_PV) this.metaTrack("PageView");
  }

  private loadTikTok(id: string) {
    const key = `tt:${id}`;
    if (this.loaded.has(key)) return;
    this.loaded.add(key);
    const w = this.w;
    if (!w.ttq) {
      // Official TikTok base code (queue stub; real SDK loads async)
      const t = "ttq";
      w.TiktokAnalyticsObject = t;
      const ttq: any = (w[t] = w[t] || []);
      ttq.methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
      ];
      ttq.setAndDefer = function (o: any, e: string) {
        o[e] = function () {
          o.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (const m of ttq.methods) ttq.setAndDefer(ttq, m);
      ttq.load = (e: string, n?: any) => {
        const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = src;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        this.appendScript(`${src}?sdkid=${encodeURIComponent(e)}&lib=${t}`);
      };
    }
    w.ttq.load(id); // page view is sent by pageView()
  }

  private loadSnapchat(id: string) {
    const key = `sc:${id}`;
    if (this.loaded.has(key)) return;
    this.loaded.add(key);
    const w = this.w;
    if (!w.snaptr) {
      const a: any = (w.snaptr = function () {
        a.handleRequest
          ? a.handleRequest.apply(a, arguments)
          : a.queue.push(arguments);
      });
      a.queue = [];
      this.appendScript("https://sc-static.net/scevent.min.js");
    }
    w.snaptr("init", id); // PAGE_VIEW is sent by pageView()
  }

  // ─── Helpers ──────────────────────────────────────

  private gtagEvent(
    name: string,
    params: Record<string, unknown>,
    sendTo: string[],
  ) {
    if (
      !this.config ||
      this.config.googleTagsViaGtm ||
      !this.w.gtag ||
      !sendTo.length
    )
      return;
    this.w.gtag("event", name, { ...params, send_to: sendTo });
  }

  private metaTrack(
    name: string,
    params?: Record<string, unknown>,
    custom = false,
  ) {
    if (!this.consent || !this.w.fbq || !this.config?.metaPixelIds.length)
      return;
    if (name === "PageView") this.w.__PC_FB_PV = true;
    this.w.fbq(custom ? "trackCustom" : "track", name, params);
  }

  private appendScript(src: string, id?: string) {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    if (id) s.id = id;
    document.head.appendChild(s);
  }
}
