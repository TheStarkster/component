
const Component = require('../component');
const Util = require('../util');
const Grid = require('./grid');
const Label = require('../label/base');

class Axis extends Component {
  getDefaultCfg() {
    const cfg = super.getDefaultCfg();
    return Util.mix({}, cfg, {
      /**
       * 用于动画，唯一标识的 id
       * @type {[type]}
       */
      _id: null,
      zIndex: 4,
      /**
       * 坐标轴上的坐标点
       * @type {Array}
       */
      ticks: null,
      /**
       * 坐标轴线的配置信息，如果设置成null，则不显示轴线
       * @type {Object}
       */
      line: null,
      /**
       * 坐标轴刻度线的配置,如果设置成null，则不显示刻度线
       * @type {Object}
       */
      tickLine: null,
      /**
       * 次刻度线个数配置
       * @type {Number}
       */
      subTickCount: 0,
      /**
       * 次刻度线样式配置
       * @type {Object}
       */
      subTickLine: null,
      /**
       * 网格线配置，如果值为 null，则不显示
       * @type {Object}
       */
      grid: null,
      /**
       * 坐标轴文本配置
       * @type {Object}
       */
      label: {
        textStyle: {
        }, // 坐标轴文本样式
        autoRotate: true,
        formatter: null // 坐标轴文本格式化回调函数
      },
      labelItems: [],
      /**
       * 坐标轴标题配置
       * @type {Object}
       */
      title: {
        autoRotate: true, // 文本是否自动旋转
        textStyle: {} // 坐标轴标题样式
      },
      autoPaint: true
    });
  }

  beforeRender() {
    const self = this;
    const title = self.get('title');
    const label = self.get('label');
    const grid = self.get('grid');
    const viewTheme = self.get('viewTheme');
    if (title) {
      self.setSilent('title', Util.deepMix({
        autoRotate: true,
        textStyle: {
          fontSize: 12,
          fill: '#ccc',
          textBaseline: 'middle',
          fontFamily: viewTheme.fontFamily,
          textAlign: 'center'
        },
        offset: 48
      }, title));
    }
    if (label) {
      self.setSilent('label', Util.deepMix({
        autoRotate: true,
        textStyle: {
          fontSize: 12,
          fill: '#ccc',
          textBaseline: 'middle',
          fontFamily: viewTheme.fontFamily
        },
        offset: 10
      }, label));
    }
    if (grid) {
      self.setSilent('grid', Util.deepMix({
        lineStyle: {
          lineWidth: 1,
          stroke: '#C0D0E0'
        }
      }, grid));
    }
  }

  render() {
    const self = this;
    const labelCfg = self.get('label');
    if (labelCfg) {
      self.renderLabels();
    }
    if (self.get('autoPaint')) {
      self.paint();
    }
    if (!Util.isNil(self.get('title'))) {
      self.renderTitle();
    }
    self.get('group').sort();
  }

  renderLabels() {
    const self = this;
    const group = self.get('group');
    const labelCfg = self.get('label');
    const labelRenderer = new Label();
    self.set('labelRenderer', labelRenderer);
    labelRenderer.set('labelCfg', labelCfg);
    if (labelCfg.labelLine) {
      labelRenderer.set('labelLine', labelCfg.labelLine);
    }
    labelRenderer.set('coord', self.get('coord'));
    labelRenderer.set('group', group.addGroup());
    labelRenderer.set('canvas', self.get('canvas'));
  }

  _parseTicks(ticks) {
    ticks = ticks || [];
    const ticksLength = ticks.length;
    for (let i = 0; i < ticksLength; i++) {
      const item = ticks[i];
      if (!Util.isObject(item)) {
        ticks[i] = this.parseTick(item, i, ticksLength);
      }
    }
    this.set('ticks', ticks);
    return ticks;
  }

  _parseCatTicks(ticks) {
    ticks = ticks || [];
    const ticksLength = ticks.length;
    for (let i = 0; i < ticksLength; i++) {
      const item = ticks[i];
      if (!Util.isObject(item)) {
        ticks[i] = this.parseTick(item, i, ticksLength);
      }
    }
    this.set('ticks', ticks);
    return ticks;
  }

  _addTickItem(index, point, length, type = '') {
    let tickItems = this.get('tickItems');
    let subTickItems = this.get('subTickItems');
    const end = this.getTickEnd(point, length, index);

    const cfg = {
      x1: point.x,
      y1: point.y,
      x2: end.x,
      y2: end.y
    };

    if (!tickItems) {
      tickItems = [];
    }

    if (!subTickItems) {
      subTickItems = [];
    }

    if (type === 'sub') {
      subTickItems.push(cfg);
    } else {
      tickItems.push(cfg);
    }

    this.set('tickItems', tickItems);
    this.set('subTickItems', subTickItems);
  }

  _renderLine() {
    const self = this;
    let lineCfg = self.get('line');
    let path;
    if (lineCfg) {
      path = self.getLinePath();
      lineCfg = Util.mix({
        path
      }, lineCfg);
      const group = self.get('group');
      const lineShape = group.addShape('path', {
        attrs: lineCfg
      });
      lineShape.name = 'axis-line';
      self.get('appendInfo') && lineShape.setSilent('appendInfo', self.get('appendInfo'));
      self.set('lineShape', lineShape);
    }
  }

  _processCatTicks() {
    const self = this;
    const labelCfg = self.get('label');
    const tickLineCfg = self.get('tickLine');
    let ticks = self.get('ticks');
    ticks = self._parseTicks(ticks);
    const new_ticks = self._getNormalizedTicks(ticks);
    for (let i = 0; i < new_ticks.length; i += 3) {
      const p = self.getTickPoint(new_ticks[i]);
      const p0 = self.getTickPoint(new_ticks[i + 1]);
      const p1 = self.getTickPoint(new_ticks[i + 2]);
      const index = Math.floor(i / 3);
      const tick = ticks[index];
      if (tickLineCfg) {
        if (index === 0) {
          self._addTickItem(index, p0, tickLineCfg.length);
        }
        self._addTickItem(index, p1, tickLineCfg.length);
      }
      if (labelCfg) {
        self.addLabel(tick, p, index);
      }
    }
  }

  _getNormalizedTicks(ticks) {
    let tickSeg = 0;
    if (ticks.length > 1) {
      tickSeg = (ticks[1].value - ticks[0].value) / 2;
    }
    const points = [];
    for (let i = 0; i < ticks.length; i++) {
      const tick = ticks[i];
      const p = tick.value;
      const p0 = tick.value - tickSeg;
      const p1 = tick.value + tickSeg;
      points.push(p, p0, p1);
    }
    const range = Util.Array.getRange(points);
    return points.map(p => {
      const norm = (p - range.min) / (range.max - range.min);
      return norm;
    });
  }

  addLabel(value, offsetPoint) {
    const self = this;
    const labelItems = self.get('labelItems');
    const labelRenderer = self.get('labelRenderer');
    const label = Util.mix({}, self.get('label'));
    let rst;
    if (labelRenderer) {
      label.text = value.text;
      label.x = offsetPoint.x;
      label.y = offsetPoint.y;
      label.point = offsetPoint;
      label.textAlign = offsetPoint.textAlign;
      if (offsetPoint.rotate) {
        label.rotate = offsetPoint.rotate;
      }
      labelItems.push(label);
    }
    return rst;
  }

  _processTicks() {
    const self = this;
    const labelCfg = self.get('label');
    const subTickCount = self.get('subTickCount');
    const tickLineCfg = self.get('tickLine');
    let ticks = self.get('ticks');
    ticks = self._parseTicks(ticks);

    Util.each(ticks, function(tick, index) {
      const tickPoint = self.getTickPoint(tick.value, index);
      if (tickLineCfg) {
        self._addTickItem(index, tickPoint, tickLineCfg.length);
      }
      if (labelCfg) {
        self.addLabel(tick, tickPoint, index);
      }
    });

    if (subTickCount) { // 如果有设置次级分点，添加次级tick
      const subTickLineCfg = self.get('subTickLine');
      Util.each(ticks, function(tick, index) {
        if (index > 0) {
          let diff = tick.value - ticks[index - 1].value;
          diff = diff / (self.get('subTickCount') + 1);

          for (let i = 1; i <= subTickCount; i++) {
            const subTick = {
              text: '',
              value: index ? ticks[index - 1].value + i * diff : i * diff
            };

            const tickPoint = self.getTickPoint(subTick.value);
            let subTickLength;
            if (subTickLineCfg && subTickLineCfg.length) {
              subTickLength = subTickLineCfg.length;
            } else {
              subTickLength = parseInt(tickLineCfg.length * (3 / 5), 10);
            }
            self._addTickItem(i - 1, tickPoint, subTickLength, 'sub');
          }
        }
      });
    }
  }

  _addTickLine(ticks, lineCfg) {
    const self = this;
    const cfg = Util.mix({}, lineCfg);
    const path = [];
    Util.each(ticks, function(item) {
      path.push([ 'M', item.x1, item.y1 ]);
      path.push([ 'L', item.x2, item.y2 ]);
    });
    delete cfg.length;
    cfg.path = path;
    const group = self.get('group');
    const tickShape = group.addShape('path', {
      attrs: cfg
    });
    tickShape.name = 'axis-ticks';
    tickShape._id = self.get('_id') + '-ticks';
    tickShape.set('coord', self.get('coord'));
    self.get('appendInfo') && tickShape.setSilent('appendInfo', self.get('appendInfo'));
  }

  _renderTicks() {
    const self = this;
    const tickItems = self.get('tickItems');
    const subTickItems = self.get('subTickItems');

    if (!Util.isEmpty(tickItems)) {
      const tickLineCfg = self.get('tickLine');
      self._addTickLine(tickItems, tickLineCfg);
    }

    if (!Util.isEmpty(subTickItems)) {
      const subTickLineCfg = self.get('subTickLine') || self.get('tickLine');
      self._addTickLine(subTickItems, subTickLineCfg);
    }
  }

  _renderGrid() {
    const grid = this.get('grid');
    if (!grid) {
      return;
    }
    grid.coord = this.get('coord');
    grid.appendInfo = this.get('appendInfo');
    const group = this.get('group');
    this.set('gridGroup', group.addGroup(Grid, grid));
  }

  _renderLabels() {
    const self = this;
    const labelRenderer = self.get('labelRenderer');
    const labelItems = self.get('labelItems');
    if (labelRenderer) {
      labelRenderer.set('items', labelItems);
      labelRenderer.render();
    }
  }

  paint() {
    const tickLineCfg = this.get('tickLine');
    let alignWithLabel = true;
    if (tickLineCfg && tickLineCfg.hasOwnProperty('alignWithLabel')) {
      alignWithLabel = tickLineCfg.alignWithLabel;
    }
    this._renderLine();
    const type = this.get('type');
    const isCat = (type === 'cat' || type === 'timeCat');
    if (isCat && alignWithLabel === false) {
      this._processCatTicks();
    } else {
      this._processTicks();
    }
    this._renderTicks();
    this._renderGrid();
    this._renderLabels();
    const labelCfg = this.get('label');
    if (labelCfg && labelCfg.autoRotate) {
      this.autoRotateLabels();
    }
  }

  parseTick(tick, index, length) {
    return {
      text: tick,
      value: index / (length - 1)
    };
  }


  getTextAnchor(vector) {
    const ratio = Math.abs(vector[1] / vector[0]);
    let align;
    if (ratio >= 1) { // 上面或者下面
      align = 'center';
    } else {
      if (vector[0] > 0) { // 右侧
        align = 'start';
      } else { // 左侧
        align = 'end';
      }
    }
    return align;
  }

  getMaxLabelWidth(labelRenderer) {
    const labels = labelRenderer.get('group').get('children');
    let max = 0;
    Util.each(labels, function(label) {
      const bbox = label.getBBox();
      const width = bbox.width;
      if (max < width) {
        max = width;
      }
    });
    return max;
  }

  destroy() {
    super.destroy();
    const gridGroup = this.get('gridGroup');
    gridGroup && gridGroup.remove();
    const labelRenderer = this.get('labelRenderer');
    labelRenderer && labelRenderer.destroy();
  }

  /**
   * 旋转文本
   * @abstract
   * @return {[type]} [description]
   */
  autoRotateLabels() {}

  /**
   * 渲染标题
   * @abstract
   * @return {[type]} [description]
   */
  renderTitle() {}

  /**
   * 获取坐标轴线的 path
   * @abstract
   * @return {[type]} [description]
   */
  getLinePath() {}

  /**
   * 获取 tick 在画布上的位置
   * @abstract
   * @return {[type]} [description]
   */
  getTickPoint() {}

  /**
   * 获取标示坐标点的线的终点
   * @abstract
   * @return {[type]} [description]
   */
  getTickEnd() {}

  /**
   * 获取距离坐标轴的向量
   * @abstract
   * @return {[type]} [description]
   */
  getSideVector() {}
}

module.exports = Axis;