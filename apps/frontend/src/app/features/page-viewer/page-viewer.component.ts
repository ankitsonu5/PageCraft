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

          const pixelId = data.project?.metaPixelId;
          if (pixelId) {
            const stored = localStorage.getItem("pc_consent");
            if (stored === "granted") {
              this.consentGiven.set(true);
              this.injectMetaPixel(pixelId);
            } else {
              this.showConsentBanner.set(true);
            }
          }
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
    const pixelId = this.page?.project?.metaPixelId;
    if (pixelId) this.injectMetaPixel(pixelId);
  }

  declineConsent() {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem("pc_consent", "denied");
    this.showConsentBanner.set(false);
  }

  private injectMetaPixel(pixelId: string) {
    if (document.getElementById("meta-pixel-script")) return;
    const s = document.createElement("script");
    s.id = "meta-pixel-script";
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
