import { Component, Input, OnInit } from '@angular/core';
import { MultilevelNode } from '../../app.model';
import { ExpandedLTR, ExpandedRTL } from '../../animation';
import { CommonUtils } from '../../common-utils';
import { CONSTANT } from '../../constants';

@Component({
  selector: 'jhi-list-item-content',
  templateUrl: './list-item-content.component.html',
  styleUrls: ['./list-item-content.component.scss'],
  animations: [ExpandedLTR, ExpandedRTL],
})
export class ListItemContentComponent implements OnInit {
  @Input() node: MultilevelNode = { label: '' };
  @Input() isRtlLayout = false;

  constructor() {
    // NOOP
  }

  ngOnInit(): void {
    // NOOP
  }

  getListIcon(node: MultilevelNode): string {
    if (!CommonUtils.isNullOrUndefinedOrEmpty(node.icon)) {
      return `icon`;
    } else if (!CommonUtils.isNullOrUndefinedOrEmpty(node.faIcon)) {
      return `faIcon`;
    } else if (!CommonUtils.isNullOrUndefinedOrEmpty(node.imageIcon)) {
      return `imageIcon`;
    } else if (!CommonUtils.isNullOrUndefinedOrEmpty(node.svgIcon)) {
      return `svgIcon`;
    } else {
      return ``;
    }
  }

  getHrefTargetType(): string {
    return this.node?.hrefTargetType ? this.node.hrefTargetType : CONSTANT.DEFAULT_HREF_TARGET_TYPE;
  }

  getSelectedSvgIcon(): string {
    if (this.node && this.node.isSelected && this.node.activeSvgIcon) return this.node.activeSvgIcon;
    else if (this.node.svgIcon) {
      return this.node.svgIcon;
    }
    return '';
  }

  getSelectedIcon(): string {
    if (this.node && this.node.isSelected && this.node.activeIcon) return this.node.activeIcon;
    else if (this.node.icon) {
      return this.node.icon;
    }
    return '';
  }

  getSelectedFaIcon(): string {
    if (this.node && this.node.isSelected && this.node.activeFaIcon) return this.node.activeFaIcon;
    else if (this.node.faIcon) {
      return this.node.faIcon;
    }
    return '';
  }

  getSelectedImageIcon(): string {
    if (this.node && this.node.isSelected && this.node.activeImageIcon) return this.node.activeImageIcon;
    else if (this.node.imageIcon) {
      return this.node.imageIcon;
    }
    return '';
  }

  nodeExpandStatus(): string {
    return this.node?.expanded ? CONSTANT.YES : CONSTANT.NO;
  }
}
