import {
  Component,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { PageService, Section } from "../../core/services/page.service";
import { ProjectService, Project } from "../../core/services/project.service";
import {
  getDefaultData,
  SectionType,
  SECTION_ELEMENTS,
  TEMPLATES,
} from "./builder.utils";
import { ElementsPanelComponent } from "./components/elements-panel/elements-panel.component";
import { CanvasComponent } from "./components/canvas/canvas.component";
import { PropertiesPanelComponent } from "./components/properties-panel/properties-panel.component";

type RailTab = "elements" | "templates" | "layers" | "settings";
type DeviceMode = "desktop" | "tablet" | "mobile";

@Component({
  selector: "app-builder",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DragDropModule,
    ElementsPanelComponent,
    CanvasComponent,
    PropertiesPanelComponent,
  ],
  templateUrl: "./builder.component.html",
})
export class BuilderComponent implements OnInit, OnDestroy {
  pageId = signal<string | null>(null);
  projectId = signal<string | null>(null);
  pageTitle = signal("");
  pageSlug = signal("");
  sections = signal<Section[]>([]);
  selectedId = signal<string | null>(null);
  deviceMode = signal<DeviceMode>("desktop");
  railTab = signal<RailTab>("elements");
  activeRsbTab = signal<"content" | "style">("content");
  isSaving = signal(false);
  savedAt = signal<Date | null>(null);
  isPublishing = signal(false);
  publishResult = signal<{ slug: string; ga4MeasurementId?: string } | null>(
    null,
  );
  showPublishModal = signal(false);
  history = signal<Section[][]>([]);
  project = signal<Project | null>(null);
  savingDefault = signal(false);
  savedDefaultType = signal<"header" | "footer" | null>(null);

  elements = SECTION_ELEMENTS;
  templates = TEMPLATES;

  selectedSection = computed(
    () => this.sections().find((s) => s.id === this.selectedId()) ?? null,
  );

  canvasWidth = computed(() => {
    const map: Record<DeviceMode, string> = {
      desktop: "100%",
      tablet: "768px",
      mobile: "390px",
    };
    return map[this.deviceMode()];
  });

  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  private autoSaveEffect = effect(() => {
    this.sections(); // track
    if (!this.pageId()) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveDraft(), 1500);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageService: PageService,
    private projectService: ProjectService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.pageId.set(id);
    this.pageService.get(id).subscribe((page) => {
      this.pageTitle.set(page.title);
      this.pageSlug.set(page.slug);
      this.projectId.set(page.projectId);
      this.sections.set((page.sections as Section[]) || []);
      // load project for header/footer defaults
      this.projectService.get(page.projectId).subscribe((proj) => {
        this.project.set(proj);
      });
    });
  }

  ngOnDestroy() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.autoSaveEffect.destroy();
  }

  addSection(type: string, atIndex?: number) {
    // Auto-load saved project header/footer if available
    let data = getDefaultData(type as SectionType);
    const proj = this.project();
    if (type === "header" && proj?.defaultHeader) {
      data = proj.defaultHeader as Record<string, unknown>;
    } else if (type === "footer" && proj?.defaultFooter) {
      data = proj.defaultFooter as Record<string, unknown>;
    }

    const s: Section = { id: crypto.randomUUID(), type, data };
    this.pushHistory();
    this.sections.update((arr) => {
      const copy = [...arr];
      atIndex !== undefined ? copy.splice(atIndex, 0, s) : copy.push(s);
      return copy;
    });
    this.selectedId.set(s.id);
  }

  applyTemplate(sectionTypes: string[]) {
    this.pushHistory();
    const newSections: Section[] = sectionTypes.map((type) => ({
      id: crypto.randomUUID(),
      type,
      data: getDefaultData(type as SectionType),
    }));
    this.sections.set(newSections);
    this.selectedId.set(null);
    this.railTab.set("elements");
  }

  deleteSection(id: string) {
    this.pushHistory();
    this.sections.update((arr) => arr.filter((s) => s.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  duplicateSection(id: string) {
    const src = this.sections().find((s) => s.id === id);
    if (!src) return;
    const clone: Section = {
      ...src,
      id: crypto.randomUUID(),
      data: structuredClone(src.data),
    };
    const idx = this.sections().findIndex((s) => s.id === id);
    this.sections.update((arr) => {
      const copy = [...arr];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
    this.selectedId.set(clone.id);
  }

  moveSection(id: string, dir: -1 | 1) {
    const arr = [...this.sections()];
    const idx = arr.findIndex((s) => s.id === id);
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    this.sections.set(arr);
  }

  onDrop(event: CdkDragDrop<Section[]>) {
    const arr = [...this.sections()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.sections.set(arr);
  }

  updateSectionData(id: string, patch: Record<string, unknown>) {
    this.sections.update((arr) =>
      arr.map((s) =>
        s.id === id ? { ...s, data: { ...s.data, ...patch } } : s,
      ),
    );
  }

  pushHistory() {
    this.history.update((h) => [
      ...h.slice(-19),
      structuredClone(this.sections()),
    ]);
  }

  undo() {
    const h = this.history();
    if (!h.length) return;
    this.sections.set(h[h.length - 1]);
    this.history.update((h) => h.slice(0, -1));
  }

  saveAsProjectDefault(type: "header" | "footer") {
    const projId = this.projectId();
    const sec = this.selectedSection();
    if (!projId || !sec) return;
    this.savingDefault.set(true);
    const payload =
      type === "header"
        ? { defaultHeader: sec.data }
        : { defaultFooter: sec.data };
    this.projectService.update(projId, payload).subscribe({
      next: (proj) => {
        this.project.set(proj);
        this.savingDefault.set(false);
        this.savedDefaultType.set(type);
        setTimeout(() => this.savedDefaultType.set(null), 2500);
      },
      error: () => this.savingDefault.set(false),
    });
  }

  saveDraft() {
    if (!this.pageId()) return;
    this.isSaving.set(true);
    this.pageService
      .update(this.pageId()!, {
        title: this.pageTitle(),
        sections: this.sections() as never,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.savedAt.set(new Date());
        },
        error: () => this.isSaving.set(false),
      });
  }

  publishPage() {
    if (!this.pageId()) return;
    this.isPublishing.set(true);
    this.pageService.publish(this.pageId()!).subscribe({
      next: (page) => {
        this.isPublishing.set(false);
        this.publishResult.set({
          slug: page.slug,
          ga4MeasurementId: page.ga4MeasurementId,
        });
        this.showPublishModal.set(true);
      },
      error: () => this.isPublishing.set(false),
    });
  }

  copyPublishedLink() {
    const slug = this.publishResult()?.slug;
    if (slug)
      navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
  }

  whatsappShare() {
    const slug = this.publishResult()?.slug;
    if (!slug) return;
    const url = encodeURIComponent(`${window.location.origin}/p/${slug}`);
    window.open(`https://wa.me/?text=${url}`, "_blank");
  }
}
