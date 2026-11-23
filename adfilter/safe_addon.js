/* AdFilter v2 supplemental HOME renderer filtering.
 * The official, published TizenTube userScript.js is preserved byte-for-byte
 * and this safe script is appended after it. Playback objects are untouched. */
;(function () {
  'use strict';
  if (typeof JSON === 'undefined' || typeof JSON.parse !== 'function' ||
      JSON.parse._cobaltAdFilterV2) return;
  var upstreamParse = JSON.parse;
  var markerKeys = [
    'adSlotRenderer', 'adPlacementRenderer', 'displayAdRenderer',
    'inFeedAdLayoutRenderer', 'promotedVideoRenderer',
    'promotedCompactVideoRenderer', 'promotedSparklesWebRenderer',
    'promotedSparklesTextSearchRenderer', 'promotedLiveBroadcastRenderer',
    'tvMastheadAdRenderer', 'playerAdRenderer', 'adBadgeRenderer'
  ];
  var linkKeys = [
    'content', 'richItemRenderer', 'richSectionRenderer',
    'itemSectionRenderer', 'elementRenderer', 'tvSurfaceContentRenderer'
  ];
  function hasAdMarker(item, depth) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    for (var i = 0; i < markerKeys.length; i++)
      if (item[markerKeys[i]] != null) return true;
    if (depth >= 3) return false;
    for (var j = 0; j < linkKeys.length; j++) {
      var child = item[linkKeys[j]];
      if (child && !Array.isArray(child) && hasAdMarker(child, depth + 1)) return true;
    }
    return false;
  }
  function cleanItems(items, depth) {
    if (!Array.isArray(items) || depth > 4) return;
    for (var i = items.length - 1; i >= 0; --i) {
      var item = items[i];
      if (hasAdMarker(item, 0)) {
        items.splice(i, 1);
        continue;
      }
      if (!item || typeof item !== 'object') continue;
      if (item.shelfRenderer && item.shelfRenderer.content)
        cleanContainers(item.shelfRenderer.content, depth + 1);
      if (item.richSectionRenderer && item.richSectionRenderer.content)
        cleanContainers(item.richSectionRenderer.content, depth + 1);
      if (item.itemSectionRenderer)
        cleanContainers(item.itemSectionRenderer, depth + 1);
    }
  }
  function cleanContainers(root, depth) {
    if (!root || typeof root !== 'object' || depth > 4) return;
    if (Array.isArray(root.contents)) cleanItems(root.contents, depth);
    if (Array.isArray(root.items)) cleanItems(root.items, depth);
    var containers = [
      ['sectionListRenderer', 'contents'],
      ['horizontalListRenderer', 'items'],
      ['gridRenderer', 'items'],
      ['richGridRenderer', 'contents'],
      ['verticalListRenderer', 'items']
    ];
    for (var i = 0; i < containers.length; i++) {
      var c = root[containers[i][0]];
      if (c && Array.isArray(c[containers[i][1]]))
        cleanItems(c[containers[i][1]], depth);
    }
  }
  function cleanResponse(r) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) return;
    var tv = r.contents && r.contents.tvBrowseRenderer && r.contents.tvBrowseRenderer.content;
    if (tv && tv.tvSurfaceContentRenderer)
      cleanContainers(tv.tvSurfaceContentRenderer.content, 0);
    if (r.contents && r.contents.sectionListRenderer)
      cleanContainers(r.contents, 0);
    var cont = r.continuationContents;
    if (cont) {
      cleanContainers(cont.sectionListContinuation, 0);
      cleanContainers(cont.horizontalListContinuation, 0);
      cleanContainers(cont.gridContinuation, 0);
      cleanContainers(cont.richGridContinuation, 0);
    }
    var actions = r.onResponseReceivedActions;
    if (Array.isArray(actions))
      for (var i = 0; i < actions.length; i++) {
        var a = actions[i] && actions[i].appendContinuationItemsAction;
        if (a && Array.isArray(a.continuationItems))
          cleanItems(a.continuationItems, 0);
      }
    var navSections = tv && tv.tvSecondaryNavRenderer && tv.tvSecondaryNavRenderer.sections;
    if (Array.isArray(navSections))
      for (var j = 0; j < navSections.length; j++) {
        var tabs = navSections[j] && navSections[j].tvSecondaryNavSectionRenderer &&
                   navSections[j].tvSecondaryNavSectionRenderer.tabs;
        if (!Array.isArray(tabs)) continue;
        for (var k = 0; k < tabs.length; k++) {
          var tabContent = tabs[k] && tabs[k].tabRenderer && tabs[k].tabRenderer.content;
          if (tabContent && tabContent.tvSurfaceContentRenderer)
            cleanContainers(tabContent.tvSurfaceContentRenderer.content, 0);
        }
      }
  }
  function enhancedParse() {
    var parsed = upstreamParse.apply(this, arguments);
    try { cleanResponse(parsed); } catch (ignore) { /* fail open */ }
    return parsed;
  }
  enhancedParse._cobaltAdFilterV2 = true;
  JSON.parse = enhancedParse;
  if (typeof window !== 'undefined') {
    window.JSON.parse = enhancedParse;
    if (window._yttv && typeof window._yttv === 'object')
      for (var name in window._yttv)
        if (Object.prototype.hasOwnProperty.call(window._yttv, name)) {
          var namespace = window._yttv[name];
          if (namespace && namespace.JSON &&
              namespace.JSON.parse === upstreamParse)
            namespace.JSON.parse = enhancedParse;
        }
    window.__cobaltAdFilterV2 = 'original-script-plus-safe-addon';
  }
})();
