import { Component, PropTypes } from 'react';

import * as util from './util';

const DOMElement = window.Element;

/**
  Portal的核心，只负责管理child。index.js实际export的不是这个component.
**/
export default class Portal extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    selector: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(DOMElement)
    ]).isRequired,
    className: PropTypes.string,
    prefix: PropTypes.string
  };

  static defaultProps = {
    selector: 'body',
    className: '',
    prefix: 'zent'
  };

  // openPortal和closePortal之所以不暴露出去是因为这两个API的调用容易出BUG，有操作是异步的。
  componentDidMount() {
    util.openPortal.call(this);
  }

  componentWillUnmount() {
    util.destroyPortal.call(this);
  }

  componentDidUpdate() {
    if (this.pendingDestroy) {
      // destroyPortal是异步的（原因看destroyPortal的代码），所以用callback的形式调用openPortal
      util.destroyPortal.call(this, () => {
        this.pendingDestroy = false;
        util.openPortal.call(this);
      });
    } else {
      util.openPortal.call(this);
    }
  }

  componentWillReceiveProps(nextProps) {
    // 如果selector变了的话，删除再重新打开
    const { selector } = this.props;
    if (selector !== nextProps.selector) {
      // 真正的工作是在componentDidUpdate里做的
      this.pendingDestroy = true;
      return;
    }

    // 如果children变了，直接重新render, react会判断是否有更新（即使这个是root节点）。
    // 这个也是在componentDidUpdate里做的。

    // 其它情况仅更新样式
    const { className, prefix } = this.props;
    if (className !== nextProps.className || prefix !== nextProps.prefix) {
      this.node.className = util.getCssClass(nextProps.prefix, nextProps.className);
    }
  }

  render() {
    return null;
  }
}