import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  SettingsService,
  TrackingSettings,
} from "../../core/services/settings.service";

type IdField = Exclude<
  keyof TrackingSettings,
  "googleTagsViaGtm" | "updatedAt"
>;

interface FieldDef {
  key: IdField;
  label: string;
  placeholder: string;
  help: string;
  pattern: RegExp;
}

/** AGL Admin → Settings → Tracking & Analytics (applies to every page). */
@Component({
  selector: "app-tracking-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header
        class="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10"
      >
        <a
          routerLink="/dashboard"
          class="text-sm text-gray-500 hover:text-gray-900"
          >← Dashboard</a
        >
        <span class="text-gray-300">/</span>
        <span class="font-semibold text-gray-900 truncate"
          >Settings · Tracking &amp; Analytics</span
        >
      </header>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          Tracking &amp; Analytics
        </h1>
        <p class="text-sm text-gray-500 mb-6">
          These IDs load automatically on
          <strong>every existing and future</strong> release page. No
          per-release setup is needed. A page can still add its own IDs for a
          special campaign (Builder → Settings → Page-level Tracking); those
          load in addition to these.
        </p>

        @if (loading()) {
          <p class="text-sm text-gray-400">Loading…</p>
        } @else {
          <form class="card p-5 sm:p-6 space-y-5" (ngSubmit)="save()">
            @for (f of fields; track f.key) {
              <div>
                <label class="label" [for]="f.key">{{ f.label }}</label>
                <input
                  class="input"
                  [id]="f.key"
                  [name]="f.key"
                  [placeholder]="f.placeholder"
                  [ngModel]="form()[f.key] || ''"
                  (ngModelChange)="patch(f.key, $event)"
                  autocomplete="off"
                  spellcheck="false"
                />
                @if (invalid(f)) {
                  <p class="text-xs text-red-600 mt-1">
                    Format looks wrong — expected e.g. {{ f.placeholder }}
                  </p>
                } @else {
                  <p class="text-xs text-gray-400 mt-1">{{ f.help }}</p>
                }
              </div>
            }

            <label
              class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer"
            >
              <input
                type="checkbox"
                class="mt-1"
                name="googleTagsViaGtm"
                [ngModel]="form().googleTagsViaGtm"
                (ngModelChange)="patchFlag($event)"
              />
              <span class="text-sm">
                <span class="font-medium text-gray-900"
                  >GA4 &amp; Google Ads tags are set up inside GTM</span
                >
                <span class="block text-xs text-gray-500 mt-0.5">
                  Tick this if your GTM container already has the GA4 / Google
                  Ads tags. The site then sends
                  <code>page_view</code> and <code>streaming_click</code> to the
                  dataLayer only and does not load GA4/Ads a second time — this
                  prevents double counting.
                </span>
              </span>
            </label>

            @if (error()) {
              <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {{ error() }}
              </p>
            }

            <div
              class="flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:justify-between"
            >
              <p class="text-xs text-gray-400">
                @if (form().updatedAt) {
                  Last saved {{ form().updatedAt | date: "medium" }}
                }
              </p>
              <button
                type="submit"
                class="btn-primary w-full sm:w-auto"
                [disabled]="saving() || hasInvalid()"
              >
                {{
                  saving() ? "Saving…" : saved() ? "✓ Saved" : "Save settings"
                }}
              </button>
            </div>
          </form>

          <div class="card p-5 sm:p-6 mt-6 text-sm text-gray-600 space-y-2">
            <p class="font-semibold text-gray-900">Events sent automatically</p>
            <p>
              <code>page_view</code> and <code>streaming_click</code> with
              <code>artist_name</code>, <code>track_name</code>,
              <code>release_type</code>, <code>page_slug</code>,
              <code>platform</code> and <code>destination_url</code>.
            </p>
            <p class="text-xs text-gray-400">
              In GTM, create Custom Event triggers named
              <code>page_view</code> and <code>streaming_click</code>
              and Data Layer Variables for the parameters above.
            </p>
          </div>
        }
      </main>
    </div>
  `,
})
export class TrackingSettingsComponent implements OnInit {
  readonly fields: FieldDef[] = [
    {
      key: "gtmId",
      label: "Google Tag Manager Container ID",
      placeholder: "GTM-XXXXXXX",
      help: "Rendered in the HTML of every page (detected by Tag Assistant / Google Ads).",
      pattern: /^GTM-[A-Z0-9]{4,12}$/i,
    },
    {
      key: "ga4MeasurementId",
      label: "GA4 Measurement ID",
      placeholder: "G-XXXXXXXXXX",
      help: "GA4 → Admin → Data streams → Web stream.",
      pattern: /^G-[A-Z0-9]{4,16}$/i,
    },
    {
      key: "googleAdsId",
      label: "Google Ads Tag ID",
      placeholder: "AW-123456789",
      help: "Google Ads → Tools → Google tag.",
      pattern: /^AW-\d{6,14}$/i,
    },
    {
      key: "googleAdsConversionLabel",
      label: "Google Ads Conversion Label (streaming click)",
      placeholder: "AbC-D_efG-h12_34-567",
      help: "Optional. Fires a conversion on every streaming_click.",
      pattern: /^[A-Za-z0-9_-]{4,64}$/,
    },
    {
      key: "metaPixelId",
      label: "Meta (Facebook) Pixel ID",
      placeholder: "123456789012345",
      help: "Loads after the visitor accepts the cookie banner.",
      pattern: /^\d{6,20}$/,
    },
    {
      key: "tiktokPixelId",
      label: "TikTok Pixel ID",
      placeholder: "C1ABCDEFGHIJKLMNOP",
      help: "TikTok Events Manager → Pixel ID.",
      pattern: /^[A-Z0-9]{8,32}$/i,
    },
    {
      key: "snapchatPixelId",
      label: "Snapchat Pixel ID",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      help: "Snap Ads Manager → Events Manager.",
      pattern: /^[a-f0-9-]{8,64}$/i,
    },
  ];

  form = signal<TrackingSettings>({
    gtmId: null,
    ga4MeasurementId: null,
    googleAdsId: null,
    googleAdsConversionLabel: null,
    metaPixelId: null,
    tiktokPixelId: null,
    snapchatPixelId: null,
    googleTagsViaGtm: false,
  });
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal("");

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.settings.getTracking().subscribe({
      next: (s) => {
        this.form.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Could not load settings.");
        this.loading.set(false);
      },
    });
  }

  patch(key: IdField, value: string) {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  patchFlag(value: boolean) {
    this.form.update((f) => ({ ...f, googleTagsViaGtm: value }));
  }

  invalid(f: FieldDef): boolean {
    const v = (this.form()[f.key] || "").trim();
    return !!v && !f.pattern.test(v);
  }

  hasInvalid(): boolean {
    return this.fields.some((f) => this.invalid(f));
  }

  save() {
    if (this.hasInvalid()) return;
    this.saving.set(true);
    this.error.set("");
    const f = this.form();
    const payload: Partial<TrackingSettings> = {
      googleTagsViaGtm: f.googleTagsViaGtm,
    };
    for (const def of this.fields)
      payload[def.key] = (f[def.key] || "").trim() || null;
    this.settings.updateTracking(payload).subscribe({
      next: (s) => {
        this.form.set(s);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error || "Could not save settings.");
      },
    });
  }
}
