import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  ProjectService,
  Project,
  PageSummary,
} from "../../core/services/project.service";
import { PageService } from "../../core/services/page.service";

@Component({
  selector: "app-project",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./project.component.html",
})
export class ProjectComponent implements OnInit {
  project = signal<Project | null>(null);
  pages = signal<PageSummary[]>([]);
  loading = signal(true);
  showNewPage = signal(false);
  creating = signal(false);
  showSettings = signal(false);
  savingSettings = signal(false);

  newTitle = signal("");
  newSlug = signal("");

  // Settings form fields
  settingsForm = signal({
    metaPixelId: "",
    metaCapiToken: "",
    klaviyoApiKey: "",
    klaviyoListId: "",
  });

  baseUrl = window.location.origin;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private pageService: PageService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.projectService.get(id).subscribe({
      next: (p) => {
        this.project.set(p);
        this.pages.set(p.pages || []);
        this.loading.set(false);
        this.settingsForm.set({
          metaPixelId: p.metaPixelId || "",
          metaCapiToken: p.metaCapiToken || "",
          klaviyoApiKey: p.klaviyoApiKey || "",
          klaviyoListId: p.klaviyoListId || "",
        });
      },
      error: () => this.loading.set(false),
    });
  }

  openSettings() {
    const p = this.project();
    if (p) {
      this.settingsForm.set({
        metaPixelId: p.metaPixelId || "",
        metaCapiToken: p.metaCapiToken || "",
        klaviyoApiKey: p.klaviyoApiKey || "",
        klaviyoListId: p.klaviyoListId || "",
      });
    }
    this.showSettings.set(true);
  }

  saveSettings() {
    const p = this.project();
    if (!p) return;
    this.savingSettings.set(true);
    this.projectService.update(p.id, this.settingsForm()).subscribe({
      next: (updated) => {
        this.project.set({ ...p, ...updated });
        this.savingSettings.set(false);
        this.showSettings.set(false);
      },
      error: () => this.savingSettings.set(false),
    });
  }

  patchSettings(field: string, value: string) {
    this.settingsForm.update((f) => ({ ...f, [field]: value }));
  }

  onTitleChange(title: string) {
    this.newTitle.set(title);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    this.newSlug.set(slug);
  }

  createPage() {
    const p = this.project();
    if (!p || !this.newTitle() || !this.newSlug()) return;
    this.creating.set(true);
    this.pageService
      .create({ projectId: p.id, title: this.newTitle(), slug: this.newSlug() })
      .subscribe({
        next: (page) => {
          this.creating.set(false);
          this.showNewPage.set(false);
          this.newTitle.set("");
          this.newSlug.set("");
          this.router.navigate(["/builder", page.id]);
        },
        error: () => this.creating.set(false),
      });
  }

  duplicatePage(e: Event, pageId: string) {
    e.stopPropagation();
    this.pageService.duplicate(pageId).subscribe((newPage) => {
      this.pages.update((arr) => [
        ...arr,
        {
          id: newPage.id,
          title: newPage.title,
          slug: newPage.slug,
          isPublished: newPage.isPublished,
          publishedAt: newPage.publishedAt,
          updatedAt: newPage.updatedAt,
          ga4MeasurementId: newPage.ga4MeasurementId,
          metaTitle: newPage.metaTitle,
        },
      ]);
    });
  }

  deletePage(e: Event, pageId: string) {
    e.stopPropagation();
    if (!confirm("This page will be permanently deleted. Are you sure?"))
      return;
    this.pageService.delete(pageId).subscribe(() => {
      this.pages.update((arr) => arr.filter((p) => p.id !== pageId));
    });
  }

  copyLink(slug: string) {
    navigator.clipboard.writeText(`${this.baseUrl}/p/${slug}`);
  }
}
