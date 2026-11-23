const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('adfilter/safe_addon.js','utf8');
const ctx={JSON:{parse:function(s){const o=JSON.parse(s);if(o&&o.adPlacements)o.adPlacements=[];if(o&&o.playerAds)o.playerAds=false;return o;},stringify:JSON.stringify},window:{_yttv:{a:{JSON:{}}}}};
ctx.window.JSON=ctx.JSON; ctx.window._yttv.a.JSON.parse=ctx.JSON.parse;
vm.createContext(ctx); vm.runInContext(code,ctx);
assert.equal(ctx.window.__cobaltAdFilterV2,'original-script-plus-safe-addon');
assert.strictEqual(ctx.window._yttv.a.JSON.parse,ctx.JSON.parse);
const sample={adPlacements:[{ad:true}],playerAds:[{ad:true}],contents:{}};
sample.contents.tvBrowseRenderer={content:{tvSurfaceContentRenderer:{content:{sectionListRenderer:{contents:[]}}}}};
const rows=sample.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents;
rows.push({adSlotRenderer:{id:'ad'}});
rows.push({shelfRenderer:{content:{horizontalListRenderer:{items:[
{tileRenderer:{contentId:'legit'}},
{richItemRenderer:{content:{promotedSparklesWebRenderer:{}}}},
{richItemRenderer:{content:{tileRenderer:{contentId:'legit2'}}}}
]}}}});
const result=ctx.JSON.parse(JSON.stringify(sample));
assert.equal(result.adPlacements.length,0); assert.equal(result.playerAds,false);
const shelves=result.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents;
assert.equal(shelves.length,1);
const videos=shelves[0].shelfRenderer.content.horizontalListRenderer.items;
assert.equal(videos.length,2); assert.equal(videos[0].tileRenderer.contentId,'legit');
assert.equal(videos[1].richItemRenderer.content.tileRenderer.contentId,'legit2');
const playback={streamingData:{adaptiveFormats:[{mimeType:'video/mp4'}]},playbackContext:{contentPlaybackContext:{isInlinePlaybackNoAd:true}}};
assert.deepStrictEqual(ctx.JSON.parse(JSON.stringify(playback)),playback);
assert.strictEqual(ctx.JSON.parse('null'),null);
console.log('PASS: original ad-removal preserved, sponsored UI cards hidden, regular videos preserved, playback unmodified');
