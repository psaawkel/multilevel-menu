import { Component, OnChanges, OnInit, OnDestroy, Output, EventEmitter, Input, ContentChild, TemplateRef, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackgroundStyle, Configuration, MultilevelNode, ExpandCollapseStatusEnum } from './app.model';
import { CONSTANT } from './constants';
import { MultilevelMenuService } from './multilevel-menu.service';
import { CommonUtils } from './common-utils';

@Component({
  selector: 'jhi-material-multilevel-menu',
  templateUrl: './ng-material-multilevel-menu.component.html',
  styleUrls: ['./ng-material-multilevel-menu.component.scss'],
})
export class NgMaterialMultilevelMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() items: MultilevelNode[] = [];
  @Input() configuration: Configuration | undefined;
  @Output() selectedItem = new EventEmitter<MultilevelNode>();
  @Output() selectedLabel = new EventEmitter<MultilevelNode>();
  @Output() menuIsReady = new EventEmitter<MultilevelNode[]>();
  @ContentChild('listTemplate', { static: true }) listTemplate!: TemplateRef<ElementRef>;

  expandCollapseStatusSubscription: Subscription | undefined;
  selectMenuByIDSubscription: Subscription | undefined;
  currentNode: MultilevelNode = { label: '' };

  itemsByID: Map<string, MultilevelNode> = new Map<string, MultilevelNode>();
  itemsByURI: Map<string, MultilevelNode> = new Map<string, MultilevelNode>();

  nodeConfig: Configuration = {
    paddingAtStart: true,
    highlightOnSelect: false,
    useDividers: true,
    rtlLayout: false,
    customTemplate: false,
  };
  isInvalidConfig = true;
  isInvalidData = true;
  nodeExpandCollapseStatus: ExpandCollapseStatusEnum = ExpandCollapseStatusEnum.neutral;

  constructor(private router: Router, public multilevelMenuService: MultilevelMenuService) {
    // NOOP
  }

  ngOnChanges(): void {
    this.detectInvalidConfig();
    this.initExpandCollapseStatus();
    this.initSelectedMenuID();
    if (!this.isInvalidData) {
      this.menuIsReady.emit(this.items);
    }
  }

  ngOnInit(): void {
    if (this.configuration && this.configuration.interfaceWithRoute) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateNodeByURL(event.urlAfterRedirects);
        }
      });
      this.updateNodeByURL(this.router.url);
    }
  }

  updateNodeByURL(url: string): void {
    // const foundNode = this.multilevelMenuService.getMatchedObjectByUrl(this.items, url);
    const foundNode = this.itemsByURI.get(url);
    if (
      foundNode !== undefined &&
      !CommonUtils.isNullOrUndefinedOrEmpty(foundNode.link)
      // && !foundNode.disabled // Prevent route redirection for disabled menu
    ) {
      this.currentNode = foundNode;
      if (!CommonUtils.isNullOrUndefined(foundNode.dontEmit) && !foundNode.dontEmit) {
        this.selectedListItem(foundNode);
      }
    }
  }

  checkValidData(): void {
    if (this.items === undefined || (Array.isArray(this.items) && this.items.length === 0)) {
      console.warn(CONSTANT.ERROR_MESSAGE);
      return;
    }
    this.items = this.items.filter(n => !n.hidden);
    this.multilevelMenuService.addRandomId(this.items);
    this.addToMapsRecursively(this.items);
    this.isInvalidData = false;
  }

  addToMapsRecursively(nodes: MultilevelNode[]): void {
    nodes.forEach((node: MultilevelNode) => {
      if (node.id) {
        this.itemsByID.set(node.id, node);
      }
      if (node.link) {
        this.itemsByURI.set(encodeURI(node.link), node);
      }
      if (node.items !== undefined) {
        this.addToMapsRecursively(node.items);
      }
    });
  }

  detectInvalidConfig(): void {
    if (!this.configuration) {
      this.isInvalidConfig = true;
    } else {
      this.isInvalidConfig = false;
      const config = this.configuration;
      if (!CommonUtils.isNullOrUndefined(config.paddingAtStart) && typeof config.paddingAtStart === 'boolean') {
        this.nodeConfig.paddingAtStart = config.paddingAtStart;
      }
      if (!CommonUtils.isNullOrUndefinedOrEmpty(config.listBackgroundColor)) {
        this.nodeConfig.listBackgroundColor = config.listBackgroundColor;
      }
      if (!CommonUtils.isNullOrUndefinedOrEmpty(config.fontColor)) {
        this.nodeConfig.fontColor = config.fontColor;
      }
      if (!CommonUtils.isNullOrUndefinedOrEmpty(config.selectedListFontColor)) {
        this.nodeConfig.selectedListFontColor = config.selectedListFontColor;
      }
      if (!CommonUtils.isNullOrUndefined(config.interfaceWithRoute) && typeof config.interfaceWithRoute === 'boolean') {
        this.nodeConfig.interfaceWithRoute = config.interfaceWithRoute;
      }
      if (!CommonUtils.isNullOrUndefined(config.collapseOnSelect) && typeof config.collapseOnSelect === 'boolean') {
        this.nodeConfig.collapseOnSelect = config.collapseOnSelect;
      }
      if (!CommonUtils.isNullOrUndefined(config.highlightOnSelect) && typeof config.highlightOnSelect === 'boolean') {
        this.nodeConfig.highlightOnSelect = config.highlightOnSelect;
      }
      if (!CommonUtils.isNullOrUndefined(config.useDividers) && typeof config.useDividers === 'boolean') {
        this.nodeConfig.useDividers = config.useDividers;
      }
      if (!CommonUtils.isNullOrUndefined(config.rtlLayout) && typeof config.rtlLayout === 'boolean') {
        this.nodeConfig.rtlLayout = config.rtlLayout;
      }
      if (!CommonUtils.isNullOrUndefined(config.customTemplate) && typeof config.customTemplate === 'boolean') {
        this.nodeConfig.customTemplate = config.customTemplate;
      }
    }
    this.checkValidData();
  }

  initExpandCollapseStatus(): void {
    this.expandCollapseStatusSubscription = this.multilevelMenuService.expandCollapseStatus$.subscribe(
      (expandCollapseStatus: ExpandCollapseStatusEnum) => {
        this.nodeExpandCollapseStatus = expandCollapseStatus ? expandCollapseStatus : ExpandCollapseStatusEnum.neutral;
      },
      () => {
        this.nodeExpandCollapseStatus = ExpandCollapseStatusEnum.neutral;
      }
    );
  }

  initSelectedMenuID(): void {
    this.selectMenuByIDSubscription = this.multilevelMenuService.selectedMenuID$.subscribe((selectedMenuID: string) => {
      if (selectedMenuID) {
        const foundNode = this.itemsByID.get(selectedMenuID);
        if (foundNode !== undefined) {
          this.currentNode = foundNode;
          this.selectedListItem(foundNode);
        }
      }
    });
  }

  getClassName(): string {
    if (!this.isInvalidConfig && this.configuration && this.configuration.classname) {
      return `${CONSTANT.DEFAULT_CLASS_NAME} ${this.configuration.classname}`;
    }
    return CONSTANT.DEFAULT_CLASS_NAME;
  }

  getGlobalStyle(): BackgroundStyle {
    const styles: BackgroundStyle = {
      background: '',
    };
    if (!this.isInvalidConfig) {
      if (this.configuration && this.configuration.backgroundColor) {
        styles.background = this.configuration.backgroundColor;
      }
    }
    return styles;
  }

  isRtlLayout(): boolean {
    return this.nodeConfig.rtlLayout === true;
  }

  selectedListItem(event: MultilevelNode): void {
    this.nodeExpandCollapseStatus = ExpandCollapseStatusEnum.neutral;
    this.currentNode = event;
    if (!CommonUtils.isNullOrUndefined(event.dontEmit) && event.dontEmit) {
      return;
    }
    if ((event.items === undefined && (!event.onSelected || typeof event.onSelected !== 'function')) || event.selectable) {
      this.selectedItem.emit(event);
    } else {
      this.selectedLabel.emit(event);
    }
  }

  ngOnDestroy(): void {
    this.expandCollapseStatusSubscription?.unsubscribe();
    this.selectMenuByIDSubscription?.unsubscribe();
  }
}
