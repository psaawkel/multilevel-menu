import { Component, Input, OnChanges, OnInit, Output, EventEmitter, TemplateRef, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Configuration, ListStyle, MultilevelNode, ExpandCollapseStatusEnum } from '../app.model';
import { CONSTANT } from '../constants';
import { MultilevelMenuService } from '../multilevel-menu.service';
import { SlideInOut } from '../animation';
import { CommonUtils } from '../common-utils';

@Component({
  selector: 'jhi-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  animations: [SlideInOut],
})
export class ListItemComponent implements OnChanges, OnInit {
  @Input() node: MultilevelNode = { label: '' };
  @Input() level = 1;
  @Input() submenuLevel = 0;
  @Input() selectedNode: MultilevelNode = { label: '' };
  @Input() nodeConfiguration: Configuration = {};
  @Input() nodeExpandCollapseStatus: ExpandCollapseStatusEnum | undefined;
  @Input() listTemplate!: TemplateRef<ElementRef>;

  @Output() selectedItem = new EventEmitter<MultilevelNode>();

  isSelected = false;
  expanded = false;
  firstInitializer = false;

  nodeChildren!: MultilevelNode[];
  classes!: { [index: string]: boolean };
  selectedListClasses: { [index: string]: boolean };

  constructor(private router: Router, public multilevelMenuService: MultilevelMenuService) {
    this.selectedListClasses = {
      [CONSTANT.DEFAULT_LIST_CLASS_NAME]: true,
      [CONSTANT.SELECTED_LIST_CLASS_NAME]: false,
      [CONSTANT.ACTIVE_ITEM_CLASS_NAME]: false,
    };
  }

  ngOnChanges(): void {
    this.nodeChildren = this.node && this.node.items ? this.node.items.filter(n => !n.hidden) : [];
    this.node.hasChildren = this.hasItems();

    if (this.selectedNode && this.selectedNode.id) {
      this.setSelectedClass(this.multilevelMenuService.recursiveCheckId(this.node, this.selectedNode.id));
    }
    this.setExpandCollapseStatus();
  }

  ngOnInit(): void {
    if (this.node.disabled) this.selectedListClasses[CONSTANT.DISABLED_ITEM_CLASS_NAME] = this.node.disabled;

    if (!CommonUtils.isNullOrUndefined(this.node.faIcon) && this.node.faIcon?.match(/\bfa\w(?!-)/) === null) {
      this.node.faIcon = `fas ${this.node.faIcon}`;
    }

    this.selectedListClasses[`level-${this.level}-submenulevel-${this.submenuLevel}`] = true;
    if (typeof this.node.expanded === 'boolean') {
      this.expanded = this.node.expanded;
    }
    this.setClasses();
  }

  setSelectedClass(isFound: boolean): void {
    if (isFound) {
      if (!this.firstInitializer) {
        this.expanded = true;
      }
      this.isSelected =
        this.nodeConfiguration.highlightOnSelect || (this.selectedNode.items === undefined || this.selectedNode.selectable ? true : false);
    } else {
      this.isSelected = false;
      if (this.nodeConfiguration.collapseOnSelect) {
        this.node.expanded = false;
        this.expanded = false;
      }
    }
    this.selectedListClasses = {
      [CONSTANT.DEFAULT_LIST_CLASS_NAME]: true,
      [CONSTANT.SELECTED_LIST_CLASS_NAME]: this.isSelected,
      [CONSTANT.ACTIVE_ITEM_CLASS_NAME]: this.selectedNode.id === this.node.id,
      [CONSTANT.DISABLED_ITEM_CLASS_NAME]: this.node.disabled ? true : false,
      [`level-${this.level}-submenulevel-${this.submenuLevel}`]: true,
    };
    this.node.isSelected = this.isSelected;
    this.setClasses();
  }

  getPaddingAtStart(): boolean {
    return this.nodeConfiguration.paddingAtStart ? true : false;
  }

  getListStyle(): ListStyle {
    const styles = {
      background: CONSTANT.DEFAULT_LIST_BACKGROUND_COLOR,
      color: CONSTANT.DEFAULT_LIST_FONT_COLOR,
    };
    if (this.nodeConfiguration.listBackgroundColor) {
      styles.background = this.nodeConfiguration.listBackgroundColor;
    }
    if (this.isSelected) {
      this.nodeConfiguration.selectedListFontColor
        ? (styles.color = this.nodeConfiguration.selectedListFontColor)
        : (styles.color = CONSTANT.DEFAULT_SELECTED_FONT_COLOR);
    } else if (this.nodeConfiguration.fontColor) {
      styles.color = this.nodeConfiguration.fontColor;
    }
    return styles;
  }

  hasItems(): boolean {
    if (this.nodeChildren) return this.nodeChildren.length > 0;
    else return false;
  }

  isRtlLayout(): boolean {
    return this.nodeConfiguration.rtlLayout ? true : false;
  }

  setClasses(): void {
    this.classes = {
      [`level-${this.level + 1}`]: true,
      [CONSTANT.SUBMENU_ITEM_CLASS_NAME]: this.hasItems() && this.getPaddingAtStart(),
      [CONSTANT.HAS_SUBMENU_ITEM_CLASS_NAME]: this.hasItems(),
    };
  }

  setExpandCollapseStatus(): void {
    if (!CommonUtils.isNullOrUndefined(this.nodeExpandCollapseStatus)) {
      if (this.nodeExpandCollapseStatus === ExpandCollapseStatusEnum.expand) {
        this.expanded = true;
        if (this.nodeConfiguration.customTemplate) {
          this.node.expanded = true;
        }
      }
      if (this.nodeExpandCollapseStatus === ExpandCollapseStatusEnum.collapse) {
        this.expanded = false;
        if (this.nodeConfiguration.customTemplate) {
          this.node.expanded = false;
        }
      }
    }
  }

  expand(node: MultilevelNode): void {
    if (node.disabled) {
      return;
    }
    this.nodeExpandCollapseStatus = ExpandCollapseStatusEnum.neutral;
    this.expanded = !this.expanded;
    this.node.expanded = this.expanded;
    this.firstInitializer = true;
    this.setClasses();
    if (
      this.nodeConfiguration.interfaceWithRoute !== null &&
      this.nodeConfiguration.interfaceWithRoute &&
      node.link !== undefined &&
      node.link
    ) {
      this.router.navigate([node.link], node.navigationExtras).then();
    } else if (node.onSelected && typeof node.onSelected === 'function') {
      node.onSelected(node);
      this.selectedListItem(node);
    } else if (node.items === undefined || this.nodeConfiguration.collapseOnSelect) {
      this.selectedListItem(node);
    } else if (node.selectable) {
      this.selectedListItem(node);
    }
  }

  selectedListItem(node: MultilevelNode): void {
    this.selectedItem.emit(node);
  }
}
