import { Component, OnInit, Inject, PLATFORM_ID, signal } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { PageService, Page } from "../../core/services/page.service";
import { SectionRendererComponent } from "../builder/components/section-renderer/section-renderer.component";

@Component({
  selector: "app-page-viewer",
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  templateUrl: "./page-viewer.component.html",
})
export class PageViewerComponent implements OnInit {
  page: Page | null = null;
  loading = true;
  notFound = false;
  consentGiven = signal(false);
  showConsentBanner = signal(false);

  constructor(
    private route: ActivatedRoute,
    private pageService: PageService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get("slug")!;
    this.pageService.getPublic(slug).subscribe({
      next: (data) => {
        this.page = data;
        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          document.title = data.metaTitle || data.title;

          if (data.ga4MeasurementId) {
            this.injectGA4(data.ga4MeasurementId);
          }

          // GTM (no consent required — loads consent mode)
          if (data.gtmId) {
            this.injectGTM(data.gtmId);
          }

          // Google Ads
          if (data.googleAdsId) {
            this.injectGoogleAds(data.googleAdsId);
          }

          // TikTok Pixel
          if (data.tiktokPixelId) {
            this.injectTikTokPixel(data.tiktokPixelId);
          }

          // Snapchat Pixel
          if (data.snapchatPixelId) {
            this.injectSnapchatPixel(data.snapchatPixelId);
          }

          // Meta Pixel (project-level) + page-level FB Pixel — require consent
          const projectPixelId = data.project?.metaPixelId;
          const pageFbPixelId = data.fbPixelId;
          const anyMetaPixel = projectPixelId || pageFbPixelId;
          if (anyMetaPixel) {
            const stored = localStorage.getItem("pc_consent");
            if (stored === "granted") {
              this.consentGiven.set(true);
              if (projectPixelId) this.injectMetaPixel(projectPixelId);
              if (pageFbPixelId && pageFbPixelId !== projectPixelId) {
                this.injectMetaPixel(pageFbPixelId, "meta-pixel-page-script");
              }
            } else {
              this.showConsentBanner.set(true);
            }
          }

          // Apply page background
          this.applyPageBackground(data.pageBgColor, data.pageBgImage);
        }
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  acceptConsent() {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem("pc_consent", "granted");
    this.consentGiven.set(true);
    this.showConsentBanner.set(false);
    const projectPixelId = this.page?.project?.metaPixelId;
    const pageFbPixelId = this.page?.fbPixelId;
    if (projectPixelId) this.injectMetaPixel(projectPixelId);
    if (pageFbPixelId && pageFbPixelId !== projectPixelId) {
      this.injectMetaPixel(pageFbPixelId, "meta-pixel-page-script");
    }
  }

  declineConsent() {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem("pc_consent", "denied");
    this.showConsentBanner.set(false);
  }

  private injectMetaPixel(pixelId: string, scriptId = "meta-pixel-script") {
    if (document.getElementById(scriptId)) return;
    const s = document.createElement("script");
    s.id = scriptId;
    s.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${pixelId}');
      fbq('track','PageView');
    `;
    document.head.appendChild(s);
  }

  private injectGTM(gtmId: string) {
    if (document.getElementById("gtm-script")) return;
    const s = document.createElement("script");
    s.id = "gtm-script";
    s.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(s);

    // GTM noscript iframe
    const ns = document.createElement("noscript");
    ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(ns, document.body.firstChild);
  }

  private injectGoogleAds(conversionId: string) {
    if (document.getElementById("google-ads-script")) return;
    const s1 = document.createElement("script");
    s1.id = "google-ads-script";
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
    document.head.appendChild(s1);

    const s2 = document.createElement("script");
    s2.innerHTML = `
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments);}
      gtag('js',new Date());
      gtag('config','${conversionId}');
    `;
    document.head.appendChild(s2);
  }

  private injectTikTokPixel(pixelId: string) {
    if (document.getElementById("tiktok-pixel-script")) return;
    const s = document.createElement("script");
    s.id = "tiktok-pixel-script";
    s.innerHTML = `
      !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
      o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');ttq.page();}(window,document,'ttq');
    `;
    document.head.appendChild(s);
  }

  private injectSnapchatPixel(pixelId: string) {
    if (document.getElementById("snapchat-pixel-script")) return;
    const s = document.createElement("script");
    s.id = "snapchat-pixel-script";
    s.innerHTML = `
      (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
      {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
      a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
      r.src=n;var u=t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r,u);})(window,document,
      'https://sc-static.net/scevent.min.js');
      snaptr('init','${pixelId}',{'user_email':'__INSERT_USER_EMAIL__'});
      snaptr('track','PAGE_VIEW');
    `;
    document.head.appendChild(s);
  }

  private applyPageBackground(bgColor?: string, bgImage?: string) {
    const wrapper = document.getElementById("page-viewer-wrapper");
    if (!wrapper) return;
    if (bgColor) {
      // Only allow valid hex/rgb/named colors — strip anything else
      const safe = /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([\d,.\s%]+\)|[a-zA-Z]+)$/.test(
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
  }

  private injectGA4(mid: string) {
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${mid}`;
    document.head.appendChild(s1);

    const s2 = document.createElement("script");
    s2.innerHTML = `
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments);}
      gtag('js',new Date());
      gtag('config','${mid}');
      document.addEventListener('click',function(e){
        var a=e.target.closest('a');
        if(a&&a.href){
          gtag('event','click',{link_url:a.href,link_text:(a.innerText||'').trim()});
        }
      });
    `;
    document.head.appendChild(s2);
  }
}
