import * as React from 'react';
import GroupFooter from './GroupFooter';
import DetailsRow from './DetailsRow';
import GroupHeader from './GroupHeader';
import List from '../List/index';
import {
  IGroup
} from './index';
import {
  IDragDropOptions
} from './../../utilities/dragdrop/interfaces';
import EventGroup from '../../utilities/eventGroup/EventGroup';
import { css } from '../../utilities/css';
import { IDetailsGroupProps } from './DetailsGroup.Props';
import './DetailsGroup.scss';

export interface IDetailsGroupState {
  isDropping?: boolean;
}

const DEFAULT_DROPPING_CSS_CLASS = 'is-dropping';

export default class DetailsGroup extends React.Component<IDetailsGroupProps, IDetailsGroupState> {
  public refs: {
    [key: string]: React.ReactInstance,
    root: HTMLElement,
    list: List
  };

  private _events: EventGroup;
  private _dragDropKey: string;

  constructor(props: IDetailsGroupProps) {
    super(props);

    this.state = {
      isDropping: false
    };

    this._onRenderCell = this._onRenderCell.bind(this);
    this._getRenderCount = this._getRenderCount.bind(this);
    this._getGroupDragDropOptions = this._getGroupDragDropOptions.bind(this);
    this._updateDroppingState = this._updateDroppingState.bind(this);

    this._events = new EventGroup(this);
  }

  public componentDidMount() {
    let { dragDropHelper } = this.props;
    if (dragDropHelper) {
      dragDropHelper.subscribe(this.refs.root, this._events, this._getGroupDragDropOptions());
    }
  }

  public componentWillUnmount() {
    this._events.dispose();

    let { dragDropHelper } = this.props;
    if (dragDropHelper) {
      dragDropHelper.unsubscribe(this.refs.root, this._dragDropKey);
    }
  }

  public render() {
    let { group, groupIndex, groupItemLimit, items, selection, onToggleCollapse, onToggleSelectGroup, onShowMore } = this.props;

    return (
      <div
        ref='root'
        className={ css('ms-DetailsList-group', this._getDroppingClassName()) }>
        <GroupHeader
          ref={ 'header' }
          group={ group }
          groupIndex={ groupIndex }
          onToggleCollapse={ onToggleCollapse }
          onToggleSelectGroup={ onToggleSelectGroup }
        />
        {
          group && group.isCollapsed ?
          null :
          <List
            ref={ 'list' }
            items={ items }
            startIndex={ group ? group.startIndex : 0 }
            renderCount={ this._getRenderCount(group) }
            onRenderCell={ this._onRenderCell }
            selection={ selection }
          />
        }
        {
          group && group.isCollapsed && !group.isShowingAll ?
          null :
          <GroupFooter
            ref={ 'footer' }
            group={ group }
            groupIndex={ groupIndex }
            groupItemLimit={ groupItemLimit }
            onShowMore={ onShowMore }
          />
        }
       </div>
    );
  }

  public forceListUpdate() {
    if (this.refs.list) {
      this.refs.list.forceUpdate();
    }
  }

  private _onRenderCell(item: any, index: number): React.ReactNode {
    let result = null;
    let { columns, selection, selectionMode, eventsToRegister, dragDropEvents, onRenderMissingItem,
      group, onRowDidMount, onRowWillUnmount, dragDropHelper } = this.props;
    let rowKey = item ? item.key : index;

    result = (
        <DetailsRow
          key={ rowKey }
          item={ item }
          itemIndex={ index }
          columns={ columns }
          selectionMode={ selectionMode }
          selection={ selection }
          onDidMount={ onRowDidMount }
          onWillUnmount={ onRowWillUnmount }
          eventsToRegister={ eventsToRegister }
          dragDropEvents={ dragDropEvents }
          dragDropHelper={ dragDropHelper }
          isGrouped={ Boolean(group) }
          />
    );

    if (!item) {
      if (onRenderMissingItem) {
        onRenderMissingItem(index);
      }
    }

    return result;
  }

  private _getRenderCount(group: IGroup) : number {
    let { items, groupItemLimit } = this.props;

    if (group) {
      return group.isShowingAll ? group.count : Math.min(group.count, groupItemLimit);
    } else {
      return items.length;
    }
  }

  /**
   * collect all the data we need to enable drag/drop for a group
   */
  private _getGroupDragDropOptions(): IDragDropOptions {
    let { group, groupIndex, dragDropEvents, eventsToRegister } = this.props;
    this._dragDropKey = 'group-' + groupIndex;
    let options = {
      key: this._dragDropKey,
      eventMap: eventsToRegister,
      selectionIndex: -1,
      context: { data: group, index: groupIndex, isGroup: true },
      canDrag: () => { return false; }, // cannot drag groups
      canDrop: dragDropEvents.canDrop,
      onDragStart: null,
      updateDropState: this._updateDroppingState
    };
    return options;
  }

  /**
   * update groupIsDropping state based on the input value, which is used to change style during drag and drop
   *
   * @private
   * @param {boolean} newValue (new isDropping state value)
   * @param {DragEvent} event (the event trigger dropping state change which can be dragenter, dragleave etc)
   */
  private _updateDroppingState(newIsDropping: boolean, event: DragEvent) {
    let { isDropping } = this.state;
    let { dragDropEvents } = this.props;

    if (!isDropping) {
      if (dragDropEvents.onDragLeave) {
        dragDropEvents.onDragLeave(event, null);
      }
    } else {
      if (dragDropEvents.onDragEnter) {
        dragDropEvents.onDragEnter(event, null);
      }
    }

    if (isDropping !== newIsDropping) {
      this.setState({ isDropping: newIsDropping });
    }
  }

  /**
   * get the correct css class to reflect the dropping state for a given group
   *
   * If the group is the current drop target, return the default dropping class name
   * Otherwise, return '';
   *
   */
  private _getDroppingClassName() : string {
    let { isDropping } = this.state;
    let { group } = this.props;

    let droppingClass = group && isDropping ? DEFAULT_DROPPING_CSS_CLASS : '';
    return droppingClass;
  }
}