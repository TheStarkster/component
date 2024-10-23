import { Group } from '@antv/g';
import { Sparkline } from '../../../../src/ui/sparkline';

export const Sparkline8 = () => {
  const group = new Group();

  group.appendChild(
    new Sparkline({
      style: {
        transform: [['translate', 10, 10]],
        type: 'column',
        width: 300,
        height: 50,
        data: [
          [10, 2, 3, 4, 15, 10, 5, 0, 3, 1],
          [5, 7, 10, 3, 10, 6, 10, 1, 5, 0],
          [1, 3, 4, 10, 15, 13, 3, 3, 10, 12],
        ],
      },
    })
  );

  return group;
};

Sparkline8.tags = ['迷你图', '条形图图', 'BUG'];
