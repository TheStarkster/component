import { Group, Rect } from '@antv/g';
import { Tooltip } from '../../../../src/ui/tooltip';

export const Tooltip8 = () => {
  const group = new Group();
  const len = 400;

  const size = [10, 10];
  const colors = new Array(size[0] * size[1]).fill(0).map((d, i, arr) => {
    const v = Math.floor((i / arr.length) * 255);
    return `rgb(${128}, ${v}, ${v})`;
  });

  for (let i = 0; i < size[0]; i++) {
    for (let j = 0; j < size[1]; j++) {
      group.appendChild(
        new Rect({
          style: {
            x: (i * len) / size[0],
            y: (j * len) / size[1],
            width: len / size[0],
            height: len / size[1],
            fill: colors[i * size[0] + j],
          },
        })
      );
    }
  }

  let tooltip: Tooltip;

  group.addEventListener('mousemove', (e: any) => {
    if (!tooltip) {
      tooltip = group.appendChild(
        new Tooltip({
          style: {
            title: 'Tooltip',
            x: e.offsetX,
            y: e.offsetY,
            offset: [20, 20],
            container: { x: 28, y: 80 },
            bounding: {
              x: 0,
              y: 0,
              width: len,
              height: len,
            },
          },
        })
      );
      document.getElementsByTagName('body')[0].appendChild(tooltip.HTMLTooltipElement);
    }

    const { target } = e;
    tooltip.update({
      x: e.offsetX,
      y: e.offsetY,
      contentKey: target.style.fill,
      content: `color: ${target.style.fill} <span style="display: inline-block; width: 10px; height: 10px; background-color: ${target.style.fill}"></span>`,
    });
  });
  group.addEventListener('mouseenter', (e: any) => {
    tooltip?.show();
  });
  group.addEventListener('mouseleave', () => {
    tooltip?.hide();
  });
  return group;
};

Tooltip8.tags = ['提示窗口', 'DOM 缓存'];
