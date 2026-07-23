import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SECTION_ELEMENTS } from "../../builder.utils";

@Component({
  selector: "app-elements-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./elements-panel.component.html",
})
export class ElementsPanelComponent {
  @Input() elements: {
    type: string;
    label: string;
    icon: string;
    category: string;
  }[] = SECTION_ELEMENTS;
  @Output() addSection = new EventEmitter<string>();

  search = signal("");

  get categories() {
    const list = this.elements && this.elements.length > 0 ? this.elements : SECTION_ELEMENTS;
    const q = this.search().toLowerCase();
    const filtered = list.filter(
      (e) => !q || (e.label && e.label.toLowerCase().includes(q)) || (e.type && e.type.includes(q)),
    );
    const map = new Map<string, typeof filtered>();
    for (const el of filtered) {
      const cat = el.category || "GENERAL";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(el);
    }
    return Array.from(map.entries());
  }
}
