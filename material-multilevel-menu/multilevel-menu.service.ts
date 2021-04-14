import { Observable, Subject } from 'rxjs';
import { MultilevelNode, ExpandCollapseStatusEnum } from './app.model';
import { CONSTANT } from './constants';

export class MultilevelMenuService {
  private expandCollapseStatus: Subject<ExpandCollapseStatusEnum> = new Subject<ExpandCollapseStatusEnum>();
  expandCollapseStatus$: Observable<ExpandCollapseStatusEnum> = this.expandCollapseStatus.asObservable();

  private selectedMenuID: Subject<string> = new Subject<string>();
  selectedMenuID$: Observable<string> = this.selectedMenuID.asObservable();

  private generateId(): string {
    let text = '';
    for (let i = 0; i < 20; i++) {
      text += CONSTANT.POSSIBLE.charAt(Math.floor(Math.random() * CONSTANT.POSSIBLE.length));
    }
    return text;
  }

  addRandomId(nodes: MultilevelNode[]): void {
    nodes.forEach((node: MultilevelNode) => {
      node.id = this.generateId();
      if (node.items !== undefined) {
        this.addRandomId(node.items);
      }
    });
  }

  recursiveCheckId(node: MultilevelNode, nodeId: string): boolean {
    if (node.id === nodeId) {
      return true;
    } else {
      if (node.items !== undefined) {
        return node.items.some((nestedNode: MultilevelNode) => {
          return this.recursiveCheckId(nestedNode, nodeId);
        });
      } else return false;
    }
  }

  // overrides key-value pipe's default reordering (by key) by implementing dummy comprarer function
  // https://angular.io/api/common/KeyValuePipe#description
  kvDummyComparerFn(): number {
    return 0;
  }

  setMenuExpandCollapseStatus(status: ExpandCollapseStatusEnum): void {
    this.expandCollapseStatus.next(status ? status : ExpandCollapseStatusEnum.neutral);
  }

  selectMenuByID(menuID: string): void {
    this.selectedMenuID.next(menuID);
  }
}
