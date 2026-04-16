import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Section } from "../../../../core/services/page.service";

@Component({
  selector: "app-properties-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./properties-panel.component.html",
})
export class PropertiesPanelComponent {
  @Input() section!: Section;
  @Input() activeTab: "content" | "style" = "content";
  @Output() tabChange = new EventEmitter<"content" | "style">();
  @Output() dataChange = new EventEmitter<Record<string, unknown>>();

  uploading = signal(false);
  uploadError = signal("");

  constructor(private http: HttpClient) {}

  get d(): Record<string, any> {
    return this.section.data as Record<string, any>;
  }

  patch(key: string, value: unknown) {
    this.dataChange.emit({ [key]: value });
  }

  patchItem(key: string, index: number, field: string, value: unknown) {
    const arr = structuredClone(this.d[key] as any[]);
    arr[index] = { ...arr[index], [field]: value };
    this.dataChange.emit({ [key]: arr });
  }

  addItem(key: string, template: Record<string, unknown>) {
    const arr = structuredClone((this.d[key] as any[]) || []);
    arr.push(template);
    this.dataChange.emit({ [key]: arr });
  }

  removeItem(key: string, index: number) {
    const arr = structuredClone(this.d[key] as any[]);
    arr.splice(index, 1);
    this.dataChange.emit({ [key]: arr });
  }

  // Footer column links helpers
  patchColumnLink(
    colIndex: number,
    linkIndex: number,
    field: string,
    value: unknown,
  ) {
    const cols = structuredClone(this.d["columns"] as any[]);
    cols[colIndex].links[linkIndex] = {
      ...cols[colIndex].links[linkIndex],
      [field]: value,
    };
    this.dataChange.emit({ columns: cols });
  }

  addColumnLink(colIndex: number) {
    const cols = structuredClone(this.d["columns"] as any[]);
    cols[colIndex].links.push({ label: "New Link", url: "#" });
    this.dataChange.emit({ columns: cols });
  }

  removeColumnLink(colIndex: number, linkIndex: number) {
    const cols = structuredClone(this.d["columns"] as any[]);
    cols[colIndex].links.splice(linkIndex, 1);
    this.dataChange.emit({ columns: cols });
  }

  uploadImage(event: Event, targetKey: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set("");
    const form = new FormData();
    form.append("file", file);
    this.http.post<{ url: string }>("/api/upload", form).subscribe({
      next: (res) => {
        this.patch(targetKey, res.url);
        this.uploading.set(false);
        input.value = "";
      },
      error: () => {
        this.uploadError.set("Upload failed. Try again.");
        this.uploading.set(false);
      },
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
