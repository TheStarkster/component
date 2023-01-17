import { renderExtDo, styleSeparator, percentTransform, type Selection } from '../../../util';
import { parsePosition } from '../../title';
import { CLASS_NAMES } from '../constant';
import type { AxisStyleProps } from '../types';

function getTitlePosition(
  mainGroup: Selection,
  titleGroup: Selection,
  cfg: AxisStyleProps
): {
  x: number;
  y: number;
} {
  const { titlePosition: position = 'lb', titleSpacing: spacing = 0 } = cfg;

  const pos = parsePosition(position);
  const { x: ax, y: ay } = mainGroup.node().getBBox();
  const [aHw, aHh] = mainGroup.node().getBounds().halfExtents;
  const [tHw, tHh] = titleGroup.node().getBounds().halfExtents;
  const [lcx, lcy] = [ax + aHw, ay + aHh];
  let [x, y] = [lcx, lcy];

  if (pos.includes('l')) x -= aHw + tHw + spacing;
  if (pos.includes('r')) x += aHw + tHw + spacing;
  if (pos.includes('t')) y -= aHh + tHh + spacing;
  if (pos.includes('b')) y += aHh + tHh + spacing;
  return { x, y };
}

function getTitleLayout(axis: Selection, titleGroup: Selection, cfg: AxisStyleProps) {
  const mainGroup = axis.select(CLASS_NAMES.mainGroup.class);
  return getTitlePosition(mainGroup, titleGroup, cfg);
}

function createTitleEl(container: Selection, cfg: AxisStyleProps) {
  const { title } = cfg;
  const titleEl = container.maybeAppendByClassName(CLASS_NAMES.title, () => renderExtDo(title!));
  return [container, titleEl];
}

function applyTitleStyle(titleEl: Selection, titleGroup: Selection, axis: Selection, cfg: AxisStyleProps, style: any) {
  const [titleStyle, { transform = '', ...groupStyle }] = styleSeparator(style);
  titleEl.styles(titleStyle);
  const { x, y } = getTitleLayout(axis, titleGroup, cfg);
  titleGroup.styles(groupStyle);
  titleGroup.node().setPosition(x, y);
  percentTransform(titleEl, transform);
}

export function renderTitle(container: Selection, axis: Selection, cfg: AxisStyleProps, style: any) {
  if (!cfg.title) return;
  const [titleGroup, titleEl] = createTitleEl(container, cfg);
  applyTitleStyle(titleEl, titleGroup, axis, cfg, style);
}
