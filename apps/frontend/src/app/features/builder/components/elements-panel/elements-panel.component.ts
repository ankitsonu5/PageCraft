import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

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
  }[] = [];
  @Output() addSection = new EventEmitter<string>();

  search = signal("");

  get categories() {
    const q = this.search().toLowerCase();
    const filtered = this.elements.filter(
      (e) => !q || e.label.toLowerCase().includes(q) || e.type.includes(q),
    );
    const map = new Map<string, typeof filtered>();
    for (const el of filtered) {
      if (!map.has(el.category)) map.set(el.category, []);
      map.get(el.category)!.push(el);
    }
    return Array.from(map.entries());
  }
}
