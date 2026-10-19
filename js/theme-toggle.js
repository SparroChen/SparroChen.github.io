(function () {
    const storageKey = 'sparro-theme';
    const root = document.documentElement;
    const palettes = {
        dark: {
            '--bg-color': '#11110F', '--surface-color': '#181816', '--text-color': '#E8E4DC',
            '--muted-color': '#99958D', '--line-color': 'rgba(232, 228, 220, 0.18)',
            '--paper': '#11110F', '--surface': '#181816', '--ink': '#E8E4DC',
            '--muted': '#99958D', '--line': 'rgba(232, 228, 220, 0.18)',
            '--header-bg': 'rgba(17, 17, 15, 0.9)'
        },
        light: {
            '--bg-color': '#fdfdfd', '--surface-color': '#f4f4f4', '--text-color': '#111111',
            '--muted-color': '#888888', '--line-color': 'rgba(17, 17, 17, 0.14)',
            '--paper': '#f4f1ea', '--surface': '#e7e2d8', '--ink': '#151515',
            '--muted': '#77736b', '--line': 'rgba(21, 21, 21, 0.2)',
            '--header-bg': 'rgba(244, 241, 234, 0.9)'
        }
    };
    const style = document.createElement('style');
    style.textContent = `body.has-theme-toggle>header,body.has-theme-toggle>.masthead{padding-right:max(7rem,env(safe-area-inset-right))!important}.theme-toggle{position:fixed;top:max(1rem,env(safe-area-inset-top));right:max(1rem,env(safe-area-inset-right));z-index:1000;border:1px solid var(--line-color,var(--line));border-radius:999px;padding:.5rem .72rem;background:color-mix(in srgb,var(--bg-color,var(--paper)) 88%,transparent);color:var(--text-color,var(--ink));font:500 .66rem/1 "Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(14px);transition:color .2s ease,background .2s ease,border-color .2s ease,opacity .2s ease}.theme-toggle:hover{opacity:.68}.theme-toggle:focus-visible{outline:2px solid currentColor;outline-offset:3px}@media(max-width:768px){body.has-theme-toggle>header,body.has-theme-toggle>.masthead{padding-right:6.2rem!important}.theme-toggle{top:max(.7rem,env(safe-area-inset-top));right:max(.7rem,env(safe-area-inset-right));padding:.46rem .62rem}}`;
    document.head.appendChild(style);
    let theme = 'dark';
    try { theme = localStorage.getItem(storageKey) === 'light' ? 'light' : 'dark'; } catch (_) {}
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.type = 'button';
    function apply(nextTheme) {
        theme = nextTheme;
        root.dataset.theme = theme;
        Object.entries(palettes[theme]).forEach(([name, value]) => root.style.setProperty(name, value));
        const next = theme === 'dark' ? 'Light' : 'Dark';
        button.textContent = next;
        button.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
        button.setAttribute('aria-pressed', String(theme === 'light'));
        try { localStorage.setItem(storageKey, theme); } catch (_) {}
    }
    button.addEventListener('click', function () { apply(theme === 'dark' ? 'light' : 'dark'); });
    apply(theme);
    document.body.classList.add('has-theme-toggle');
    document.body.appendChild(button);
})();
