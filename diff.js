// diff.js — WER/CER + diff highlighting
const SpeechDiff = (() => {
  // Normalize text for comparison
  function normalize(str) {
    return str.toLowerCase().replace(/[^a-zæøå0-9\s]/gi, '').replace(/\s+/g, ' ').trim();
  }

  // Word Error Rate
  function wer(ref, hyp) {
    const r = normalize(ref).split(' ');
    const h = normalize(hyp).split(' ');
    const d = Array(r.length + 1).fill().map(() => Array(h.length + 1).fill(0));

    for (let i = 0; i <= r.length; i++) d[i][0] = i;
    for (let j = 0; j <= h.length; j++) d[0][j] = j;

    for (let i = 1; i <= r.length; i++) {
      for (let j = 1; j <= h.length; j++) {
        const cost = r[i - 1] === h[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
      }
    }
    return d[r.length][h.length] / r.length;
  }

  // Character Error Rate
  function cer(ref, hyp) {
    const r = normalize(ref).replace(/\s/g, '');
    const h = normalize(hyp).replace(/\s/g, '');
    const d = Array(r.length + 1).fill().map(() => Array(h.length + 1).fill(0));

    for (let i = 0; i <= r.length; i++) d[i][0] = i;
    for (let j = 0; j <= h.length; j++) d[0][j] = j;

    for (let i = 1; i <= r.length; i++) {
      for (let j = 1; j <= h.length; j++) {
        const cost = r[i - 1] === h[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
      }
    }
    return d[r.length][h.length] / r.length;
  }

  // Highlight differences (simple)
  function diff(ref, hyp) {
    const refWords = normalize(ref).split(' ');
    const hypWords = normalize(hyp).split(' ');
    const out = [];
    const len = Math.max(refWords.length, hypWords.length);
    for (let i = 0; i < len; i++) {
      if (refWords[i] === hypWords[i]) {
        out.push(refWords[i]);
      } else {
        if (refWords[i]) out.push(`<span style='color:red;text-decoration:line-through;'>${refWords[i]}</span>`);
        if (hypWords[i]) out.push(`<span style='color:green;'>${hypWords[i]}</span>`);
      }
    }
    return out.join(' ');
  }

  return { wer, cer, diff };
})();