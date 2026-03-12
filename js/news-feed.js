// =============================================
// TRENDPULSE — LIVE NEWS ENGINE
// news-feed.js
// Uses NewsAPI.org — get your FREE key at:
// https://newsapi.org/register
// =============================================

const TrendPulseNews = (() => {

    // -----------------------------------------------
    //  ⚙️  CONFIGURATION — SET YOUR API KEY BELOW
    // -----------------------------------------------
    const CONFIG = {
        API_KEY: 'eea75de0deff4ca2996edb332a698f4f',   // 👈 Replace with your key from newsapi.org
        API_BASE: 'https://newsapi.org/v2/everything',
        CACHE_TTL_MS: 15 * 60 * 1000,       // 15 minutes cache
        MAX_ARTICLES: 60,                    // articles per fetch
        ARTICLES_PER_PAGE: 9,               // articles shown at once
        LANGUAGE: 'en',
    };

    // -----------------------------------------------
    //  🗂️  LOCAL DATABASE (localStorage)
    // -----------------------------------------------
    const DB = {
        KEY_PREFIX: 'trendpulse_news_',

        save(topic, articles) {
            const record = { ts: Date.now(), articles };
            try {
                localStorage.setItem(DB.KEY_PREFIX + topic, JSON.stringify(record));
            } catch (e) {
                // Storage full — clear old entries
                DB.clearAll();
                try { localStorage.setItem(DB.KEY_PREFIX + topic, JSON.stringify(record)); } catch (_) { }
            }
        },

        load(topic) {
            try {
                const raw = localStorage.getItem(DB.KEY_PREFIX + topic);
                if (!raw) return null;
                const record = JSON.parse(raw);
                if (Date.now() - record.ts > CONFIG.CACHE_TTL_MS) return null; // Expired
                return record.articles;
            } catch (_) { return null; }
        },

        clearAll() {
            Object.keys(localStorage)
                .filter(k => k.startsWith(DB.KEY_PREFIX))
                .forEach(k => localStorage.removeItem(k));
        },

        saveStats(stats) {
            localStorage.setItem('trendpulse_stats', JSON.stringify({ ts: Date.now(), stats }));
        },

        loadStats() {
            try {
                const raw = localStorage.getItem('trendpulse_stats');
                if (!raw) return null;
                const r = JSON.parse(raw);
                if (Date.now() - r.ts > CONFIG.CACHE_TTL_MS) return null;
                return r.stats;
            } catch (_) { return null; }
        }
    };

    // -----------------------------------------------
    //  📰  TOPICS CONFIGURATION
    // -----------------------------------------------
    const TOPICS = {
        'usa-israel-iran': {
            label: 'USA · Israel · Iran',
            query: 'Iran OR Israel OR "United States" conflict 2025',
            sortBy: 'publishedAt',
            color: '#00d4ff',
            icon: '🌐',
        },
        'ukraine-russia': {
            label: 'Ukraine · Russia War',
            query: 'Ukraine Russia war frontline 2025',
            sortBy: 'publishedAt',
            color: '#ff3b5c',
            icon: '⚔️',
        },
        'gaza': {
            label: 'Gaza · Middle East',
            query: 'Gaza war Hamas ceasefire Middle East 2025',
            sortBy: 'publishedAt',
            color: '#ff8c42',
            icon: '🏙️',
        },
        'strait-hormuz': {
            label: 'Strait of Hormuz',
            query: '"Strait of Hormuz" OR "Persian Gulf" Iran oil tanker blockade',
            sortBy: 'publishedAt',
            color: '#00d4ff',
            icon: '🚢',
        },
        'iran-nuclear': {
            label: 'Iran Nuclear',
            query: 'Iran nuclear uranium enrichment IAEA sanctions 2025',
            sortBy: 'publishedAt',
            color: '#ffd166',
            icon: '☢️',
        },
        'red-sea': {
            label: 'Red Sea · Houthis',
            query: 'Red Sea Houthi shipping attack Yemen 2025',
            sortBy: 'publishedAt',
            color: '#ff3b5c',
            icon: '⚓',
        },
        'taiwan-china': {
            label: 'China · Taiwan',
            query: 'China Taiwan military PLA strait crisis 2025',
            sortBy: 'publishedAt',
            color: '#ff8c42',
            icon: '🗺️',
        },
        'world': {
            label: 'All World News',
            query: 'war conflict geopolitics military 2025',
            sortBy: 'publishedAt',
            color: '#a78bfa',
            icon: '🌍',
        },
    };

    // -----------------------------------------------
    //  🌐  FETCH LIVE NEWS
    // -----------------------------------------------
    async function fetchNews(topicKey, forceRefresh = false) {
        const topic = TOPICS[topicKey];
        if (!topic) return [];

        // Check cache first
        if (!forceRefresh) {
            const cached = DB.load(topicKey);
            if (cached) return cached;
        }

        if (CONFIG.API_KEY === 'YOUR_NEWSAPI_KEY_HERE') {
            console.warn('[TrendPulse] NewsAPI key not set. Using demo data.');
            return getDemoData(topicKey);
        }

        const url = new URL(CONFIG.API_BASE);
        url.searchParams.set('q', topic.query);
        url.searchParams.set('sortBy', topic.sortBy || 'publishedAt');
        url.searchParams.set('language', CONFIG.LANGUAGE);
        url.searchParams.set('pageSize', CONFIG.MAX_ARTICLES);
        url.searchParams.set('apiKey', CONFIG.API_KEY);

        try {
            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.status === 'ok' && data.articles?.length) {
                const cleaned = data.articles
                    .filter(a => a.title && a.title !== '[Removed]' && a.url)
                    .map(a => ({
                        title: a.title,
                        description: a.description || '',
                        url: a.url,
                        source: a.source?.name || 'Unknown',
                        publishedAt: a.publishedAt,
                        urlToImage: a.urlToImage || null,
                        author: a.author || null,
                    }));
                DB.save(topicKey, cleaned);
                return cleaned;
            }
            console.warn('[TrendPulse] NewsAPI error:', data.message);
            return getDemoData(topicKey);
        } catch (err) {
            console.error('[TrendPulse] Fetch failed:', err);
            return getDemoData(topicKey);
        }
    }

    // -----------------------------------------------
    //  ⏱️  RELATIVE TIME
    // -----------------------------------------------
    function timeAgo(dateStr) {
        const now = new Date();
        const then = new Date(dateStr);
        const diff = Math.floor((now - then) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    // -----------------------------------------------
    //  🖼️  RENDER ARTICLE CARD
    // -----------------------------------------------
    function renderArticleCard(article, topicKey) {
        const topic = TOPICS[topicKey] || TOPICS['world'];
        const img = article.urlToImage
            ? `<div class="nc-img" style="background-image:url('${article.urlToImage}')"></div>`
            : `<div class="nc-img nc-img-placeholder" style="background:linear-gradient(135deg,rgba(${hexToRgb(topic.color)},0.15),rgba(0,0,0,0.3));display:flex;align-items:center;justify-content:center;font-size:2.5rem;">${topic.icon}</div>`;

        return `
      <article class="news-card" onclick="window.open('${article.url}','_blank')" title="${article.title}">
        ${img}
        <div class="nc-body">
          <div class="nc-meta">
            <span class="nc-source" style="color:${topic.color};">${article.source}</span>
            <span class="nc-time">${timeAgo(article.publishedAt)}</span>
          </div>
          <h3 class="nc-title">${article.title}</h3>
          ${article.description ? `<p class="nc-desc">${article.description.slice(0, 120)}${article.description.length > 120 ? '…' : ''}</p>` : ''}
          <span class="nc-read">Read Full Article ↗</span>
        </div>
      </article>`;
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    }

    // -----------------------------------------------
    //  📰  RENDER NEWS GRID
    // -----------------------------------------------
    async function renderNewsGrid(containerId, topicKey, page = 1, forceRefresh = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `<div class="news-loading"><div class="nl-spinner"></div><p>Fetching live news…</p></div>`;

        const articles = await fetchNews(topicKey, forceRefresh);
        if (!articles.length) {
            container.innerHTML = `<div class="news-empty">⚠️ No articles found. Check your API key or try again.</div>`;
            return;
        }

        const start = (page - 1) * CONFIG.ARTICLES_PER_PAGE;
        const slice = articles.slice(start, start + CONFIG.ARTICLES_PER_PAGE);
        container.innerHTML = slice.map(a => renderArticleCard(a, topicKey)).join('');

        // Animate cards in
        requestAnimationFrame(() => {
            container.querySelectorAll('.news-card').forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 60);
            });
        });

        return articles.length;
    }

    // -----------------------------------------------
    //  🏷️  RENDER TOPIC TABS
    // -----------------------------------------------
    function renderTopicTabs(containerId, activeTopic, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = Object.entries(TOPICS).map(([key, t]) => `
      <button class="topic-tab ${key === activeTopic ? 'active' : ''}"
              data-topic="${key}"
              style="${key === activeTopic ? `border-color:${t.color};color:${t.color};background:rgba(${hexToRgb(t.color)},0.1);` : ''}"
              onclick="TrendPulseNews.selectTopic('${key}')">
        ${t.icon} ${t.label}
      </button>`).join('');
    }

    // -----------------------------------------------
    //  🔄  LIVE NEWS PAGE CONTROLLER
    // -----------------------------------------------
    let _currentTopic = 'world';
    let _currentPage = 1;
    let _totalArticles = 0;
    let _refreshInterval = null;

    async function initNewsPage() {
        _currentTopic = new URLSearchParams(window.location.search).get('topic') || 'world';
        _currentPage = 1;

        renderTopicTabs('newsTopicTabs', _currentTopic);
        await loadPage();

        // Auto-refresh every 15 minutes
        _refreshInterval = setInterval(() => loadPage(true), CONFIG.CACHE_TTL_MS);

        // Live countdown timer
        startRefreshCountdown();
    }

    async function loadPage(forceRefresh = false) {
        updateLastRefreshed();
        const total = await renderNewsGrid('newsGrid', _currentTopic, _currentPage, forceRefresh);
        _totalArticles = total || 0;
        updatePagination();
        updatePageHeading();
    }

    function selectTopic(topicKey) {
        _currentTopic = topicKey;
        _currentPage = 1;
        renderTopicTabs('newsTopicTabs', _currentTopic);
        loadPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToPage(page) {
        _currentPage = page;
        loadPage();
        document.getElementById('newsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updatePagination() {
        const pag = document.getElementById('newsPagination');
        if (!pag) return;
        const totalPages = Math.ceil(_totalArticles / CONFIG.ARTICLES_PER_PAGE);
        if (totalPages <= 1) { pag.innerHTML = ''; return; }
        let html = '';
        if (_currentPage > 1) html += `<button class="pag-btn" onclick="TrendPulseNews.goToPage(${_currentPage - 1})">← Prev</button>`;
        for (let i = Math.max(1, _currentPage - 2); i <= Math.min(totalPages, _currentPage + 2); i++) {
            html += `<button class="pag-btn ${i === _currentPage ? 'active' : ''}" onclick="TrendPulseNews.goToPage(${i})">${i}</button>`;
        }
        if (_currentPage < totalPages) html += `<button class="pag-btn" onclick="TrendPulseNews.goToPage(${_currentPage + 1})">Next →</button>`;
        pag.innerHTML = html;
    }

    function updatePageHeading() {
        const t = TOPICS[_currentTopic];
        const h = document.getElementById('newsHeading');
        if (h) h.innerHTML = `${t.icon} <span style="color:${t.color};">${t.label}</span> — Live News`;
        const sub = document.getElementById('newsSubheading');
        if (sub) sub.textContent = `${_totalArticles} articles fetched · Showing page ${_currentPage}`;
    }

    function updateLastRefreshed() {
        const el = document.getElementById('lastRefreshed');
        if (el) el.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    let _countdown = 900;
    function startRefreshCountdown() {
        _countdown = 900;
        const el = document.getElementById('refreshCountdown');
        setInterval(() => {
            _countdown--;
            if (_countdown <= 0) _countdown = 900;
            if (el) {
                const m = Math.floor(_countdown / 60);
                const s = _countdown % 60;
                el.textContent = `Next refresh in ${m}:${String(s).padStart(2, '0')}`;
            }
        }, 1000);
    }

    // -----------------------------------------------
    //  📡  CONFLICTS PAGE — LIVE FEED WIDGET
    // -----------------------------------------------
    async function initConflictsFeed(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `<div class="news-loading"><div class="nl-spinner"></div><p>Loading live headlines…</p></div>`;

        // Fetch top 5 from multiple topics
        const topics = ['usa-israel-iran', 'strait-hormuz', 'iran-nuclear', 'ukraine-russia', 'gaza'];
        const fetches = await Promise.allSettled(topics.map(t => fetchNews(t)));

        let all = [];
        fetches.forEach((res, i) => {
            if (res.status === 'fulfilled') {
                all = all.concat(res.value.slice(0, 3).map(a => ({ ...a, _topic: topics[i] })));
            }
        });

        // Sort by date
        all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        const top = all.slice(0, 8);

        if (!top.length) {
            container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Enable NewsAPI to see live headlines.</p>';
            return;
        }

        container.innerHTML = top.map(article => {
            const topic = TOPICS[article._topic];
            return `
        <div class="live-feed-item" onclick="window.open('${article.url}','_blank')" style="cursor:pointer;">
          <div class="lfi-dot" style="background:${topic.color};box-shadow:0 0 6px ${topic.color};"></div>
          <div class="lfi-body">
            <span class="lfi-topic" style="color:${topic.color};">${topic.label}</span>
            <p class="lfi-title">${article.title}</p>
            <div class="lfi-meta">
              <span>${article.source}</span>
              <span>${timeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </div>`;
        }).join('');
    }

    // -----------------------------------------------
    //  🧪  DEMO DATA (when no API key is set)
    // -----------------------------------------------
    function getDemoData(topicKey) {
        const demos = {
            'usa-israel-iran': [
                { title: '[DEMO] US 5th Fleet Conducts Exercises Near Strait of Hormuz Amid Iran Tensions', description: 'The United States Navy conducted major exercises involving two carrier strike groups in the Persian Gulf as Iran-US tensions remain elevated following renewed nuclear talks failure.', url: '#', source: 'Reuters (Demo)', publishedAt: new Date(Date.now() - 3600000).toISOString(), urlToImage: null },
                { title: '[DEMO] Israel Intercepts Iranian Drone Swarm Over Northern Border', description: 'Iron Dome and Arrow missile defense systems activated as Iran-backed forces launched coordinated strike package toward Israeli territory.', url: '#', source: 'AP News (Demo)', publishedAt: new Date(Date.now() - 7200000).toISOString(), urlToImage: null },
                { title: '[DEMO] Iran Warns of "Decisive Response" if Nuclear Sites Targeted', description: 'Iranian Supreme Leader issues rare public statement warning that any attack on nuclear infrastructure would result in a response targeting US assets in the region.', url: '#', source: 'BBC (Demo)', publishedAt: new Date(Date.now() - 10800000).toISOString(), urlToImage: null },
            ],
            'strait-hormuz': [
                { title: '[DEMO] Oil Prices Surge as Tanker Seized Near Strait of Hormuz', description: 'Crude oil futures jumped 4% after IRGC naval vessels boarded and detained a Panamanian-flagged oil tanker in disputed waters near the Persian Gulf entrance.', url: '#', source: 'Bloomberg (Demo)', publishedAt: new Date(Date.now() - 1800000).toISOString(), urlToImage: null },
                { title: '[DEMO] US Deploys Additional Mine-Sweepers to Persian Gulf', description: 'Pentagon confirms additional MCM vessels deployed as intelligence indicates Iranian Revolutionary Guard Corps mining preparations near Hormuz shipping lanes.', url: '#', source: 'Defense News (Demo)', publishedAt: new Date(Date.now() - 5400000).toISOString(), urlToImage: null },
            ],
            'iran-nuclear': [
                { title: '[DEMO] IAEA: Iran Has Enough Fissile Material for 3 Nuclear Bombs', description: 'UN nuclear watchdog report confirms Iran\'s enriched uranium stockpile has grown to historic highs, with breakout timeline now measured in days not months.', url: '#', source: 'IAEA/Reuters (Demo)', publishedAt: new Date(Date.now() - 2700000).toISOString(), urlToImage: null },
            ],
            'ukraine-russia': [
                { title: '[DEMO] Russian Forces Advance in Zaporizhzhia as Ceasefire Talks Stall', description: 'Ukrainian military reports Russian armored units pushed 3km into contested territory overnight as peace negotiations in Istanbul remain deadlocked.', url: '#', source: 'Al Jazeera (Demo)', publishedAt: new Date(Date.now() - 4500000).toISOString(), urlToImage: null },
            ],
            'gaza': [
                { title: '[DEMO] Gaza Ceasefire Collapses; IDF Resumes Operations in Northern Khan Younis', description: 'The temporary ceasefire brokered by Qatar and Egypt has broken down after Hamas rejected a revised hostage-for-prisoner exchange formula.', url: '#', source: 'Times of Israel (Demo)', publishedAt: new Date(Date.now() - 3000000).toISOString(), urlToImage: null },
            ],
        };
        return demos[topicKey] || demos['usa-israel-iran'];
    }

    // -----------------------------------------------
    //  📤  PUBLIC API
    // -----------------------------------------------
    return {
        init: initNewsPage,
        initConflictsFeed,
        selectTopic,
        goToPage,
        refresh: () => loadPage(true),
        clearCache: () => { DB.clearAll(); loadPage(true); },
        TOPICS,
    };

})();

// Expose globally
window.TrendPulseNews = TrendPulseNews;
