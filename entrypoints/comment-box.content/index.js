import './style.css';

// The job-notes / chat comment box is a bottom-anchored compose bar, so the
// natural way to make it "expandable" is to auto-grow it upward as the note
// gets long (like iMessage/Slack) rather than a drag handle that fights the
// layout. It grows to fit the content up to half the viewport, then scrolls.
export default defineContentScript({
  matches: ['*://recurse.com/*', '*://*.recurse.com/*'],

  main() {
    const SELECTOR = 'textarea.comment-box__textarea';

    document.querySelectorAll(SELECTOR).forEach(enhance);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.(SELECTOR)) enhance(node);
          node.querySelectorAll?.(SELECTOR).forEach(enhance);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function enhance(textarea) {
      if (textarea.dataset.refinedRecurse) return;
      textarea.dataset.refinedRecurse = '1';

      // The site's default (multi-line) height — never shrink below it.
      const baseHeight = textarea.offsetHeight || 98;

      const grow = () => {
        // Empty: revert to the site's default. (A long placeholder would
        // otherwise inflate scrollHeight.)
        if (textarea.value === '') {
          textarea.style.height = '';
          return;
        }
        const max = Math.round(window.innerHeight * 0.5);
        textarea.style.height = 'auto';
        const fit = Math.min(Math.max(textarea.scrollHeight, baseHeight), max);
        textarea.style.height = `${fit}px`;
      };

      textarea.addEventListener('input', grow);
      window.addEventListener('resize', grow);

      grow();
      // Saved notes on job pages populate after render without firing 'input'.
      requestAnimationFrame(grow);
      setTimeout(grow, 500);
    }
  },
});
