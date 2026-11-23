// Sky Shark experimental filter for known advertisement renderer objects.
// Does not remove ordinary uploaded videos marked as paid promotions.
const KEYS = new Set([
  'adSlotRenderer', 'adPlacementRenderer', 'displayAdRenderer',
  'inFeedAdLayoutRenderer', 'promotedVideoRenderer',
  'promotedCompactVideoRenderer', 'promotedSparklesWebRenderer',
  'promotedSparklesTextSearchRenderer', 'promotedLiveBroadcastRenderer',
  'tvMastheadAdRenderer', 'playerAdRenderer'
]);
function isAd(item, depth = 0) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  if (Object.keys(item).some(k => KEYS.has(k))) return true;
  if (depth >= 2) return false;
  return [
    item.richItemRenderer?.content,
    item.richSectionRenderer?.content,
    item.elementRenderer?.content,
    item.itemSectionRenderer?.contents?.[0]
  ].some(v => isAd(v, depth + 1));
}
function clean(items, depth = 0) {
  if (!Array.isArray(items) || depth > 5) return items;
  return items.filter(item => !isAd(item)).map(item => {
    if (!item || typeof item !== 'object') return item;
    for (const view of [
      item.shelfRenderer?.content,
      item.richSectionRenderer?.content,
      item.itemSectionRenderer,
      item.richItemRenderer?.content
    ]) {
      if (!view || typeof view !== 'object') continue;
      for (const [parent, field] of [
        [view.horizontalListRenderer,'items'],
        [view.gridRenderer,'items'],
        [view.richGridRenderer,'contents'],
        [view.verticalListRenderer,'items'],
        [view.sectionListRenderer,'contents']
      ]) {
        if (Array.isArray(parent?.[field])) parent[field] = clean(parent[field], depth + 1);
      }
    }
    return item;
  });
}
function cleanContainer(c) {
  if (!c || typeof c !== 'object') return;
  for (const k of ['contents','items'])
    if (Array.isArray(c[k])) c[k] = clean(c[k]);
  for (const [parent,k] of [
    [c.sectionListRenderer,'contents'],
    [c.gridRenderer,'items'],
    [c.richGridRenderer,'contents'],
    [c.horizontalListRenderer,'items']
  ]) if (Array.isArray(parent?.[k])) parent[k] = clean(parent[k]);
}
export function cleanKnownPromotions(r) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return r;
  const tv = r.contents?.tvBrowseRenderer?.content;
  const surface = tv?.tvSurfaceContentRenderer?.content;
  cleanContainer(surface);
  cleanContainer(r.contents);
  cleanContainer(r.continuationContents?.sectionListContinuation);
  cleanContainer(r.continuationContents?.horizontalListContinuation);
  cleanContainer(r.continuationContents?.gridContinuation);
  cleanContainer(r.contents?.singleColumnWatchNextResults?.pivot);
  for (const action of (Array.isArray(r.onResponseReceivedActions) ? r.onResponseReceivedActions : [])) {
    const c = action?.appendContinuationItemsAction;
    if (Array.isArray(c?.continuationItems)) c.continuationItems = clean(c.continuationItems);
  }
  for (const s of (Array.isArray(tv?.tvSecondaryNavRenderer?.sections) ? tv.tvSecondaryNavRenderer.sections : [])) {
    const tabs = s?.tvSecondaryNavSectionRenderer?.tabs;
    for (const tab of (Array.isArray(tabs) ? tabs : []))
      cleanContainer(tab?.tabRenderer?.content?.tvSurfaceContentRenderer?.content);
  }
  return r;
}
