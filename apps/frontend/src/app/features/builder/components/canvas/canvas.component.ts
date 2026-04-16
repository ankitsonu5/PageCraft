import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { Section } from "../../../../core/services/page.service";
import { SectionRendererComponent } from "../section-renderer/section-renderer.component";

@Component({
  selector: "app-canvas",
  standalone: true,
  imports: [CommonModule, DragDropModule, SectionRendererComponent],
  templateUrl: "./canvas.component.html",
})
export class CanvasComponent {
  @Input() sections: Section[] = [];
  @Input() selectedId: string | null = null;
  @Input() canvasWidth = "100%";

  @Output() selectSection = new EventEmitter<string>();
  @Output() addSection = new EventEmitter<string>();
  @Output() deleteSection = new EventEmitter<string>();
  @Output() duplicateSection = new EventEmitter<string>();
  @Output() moveSection = new EventEmitter<[string, -1 | 1]>();
  @Output() dropped = new EventEmitter<CdkDragDrop<Section[]>>();

  hoveredId: string | null = null;

  onDrop(event: CdkDragDrop<Section[]>) {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.dropped.emit(event);
  }
}
