/* Typography adjustment only. Original manuscript paragraph IDs remain unchanged. */
(function () {
  const TIGHT = new Set(["改革前", "改革后"]);
  // 面板标题前缀：成效（X之越）青色，边界（X回弹）金色；对应原稿“四越四墙”
  const PREFIX = { "成效 / ": "#9ff3ff", "边界 / ": "#ffd67e" };
  const SVG = "http://www.w3.org/2000/svg";
  function tintPrefix(text) {
    if (text.dataset.prefixTinted || text.childElementCount) return;
    const value = text.textContent;
    const key = Object.keys(PREFIX).find((k) => value.startsWith(k));
    if (!key) return;
    const head = document.createElementNS(SVG, "tspan");
    head.setAttribute("fill", PREFIX[key]);
    head.textContent = key;
    text.textContent = value.slice(key.length);
    text.insertBefore(head, text.firstChild);
    text.dataset.prefixTinted = "1";
  }
  function run(root) {
    root.querySelectorAll("svg.topic-art text[font-size='18']").forEach((text) => {
      if (TIGHT.has(text.textContent.trim())) text.setAttribute("font-size", "16");
    });
    root.querySelectorAll("svg.topic-art text").forEach(tintPrefix);
  }
  function start() {
    run(document);
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; run(document); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) observer.disconnect();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
