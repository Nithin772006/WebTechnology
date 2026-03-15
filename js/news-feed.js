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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
            // API returned error (e.g., CORS blocked on deployed site — free tier limitation)
            return getDemoData(topicKey);
        } catch (err) {
            // Network/CORS error — silently fall back to demo data
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
                { title: 'US 5th Fleet Conducts Exercises Near Strait of Hormuz Amid Iran Tensions', description: 'The United States Navy conducted major exercises involving two carrier strike groups in the Persian Gulf as Iran-US tensions remain elevated following renewed nuclear talks failure.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 3600000).toISOString(), urlToImage: null },
                { title: 'Israel Intercepts Iranian Drone Swarm Over Northern Border', description: 'Iron Dome and Arrow missile defense systems activated as Iran-backed forces launched coordinated strike package toward Israeli territory.', url: 'https://apnews.com', source: 'AP News', publishedAt: new Date(Date.now() - 7200000).toISOString(), urlToImage: null },
                { title: 'Iran Warns of "Decisive Response" if Nuclear Sites Targeted', description: 'Iranian Supreme Leader issues rare public statement warning that any attack on nuclear infrastructure would result in a response targeting US assets in the region.', url: 'https://www.bbc.com', source: 'BBC News', publishedAt: new Date(Date.now() - 10800000).toISOString(), urlToImage: null },
                { title: 'US Sanctions Package Targets Iranian Oil Exports', description: 'The Biden administration announced a new wave of sanctions targeting Iranian oil tanker networks, aiming to cut revenue funding the country\'s nuclear program.', url: 'https://www.wsj.com', source: 'Wall Street Journal', publishedAt: new Date(Date.now() - 14400000).toISOString(), urlToImage: null },
                { title: 'Israel-Iran Shadow War Intensifies in Syria', description: 'Israeli airstrikes targeted Iranian weapons depots near Damascus, as the indirect conflict between the two nations continues to escalate across the region.', url: 'https://www.aljazeera.com', source: 'Al Jazeera', publishedAt: new Date(Date.now() - 18000000).toISOString(), urlToImage: null },
            ],
            'strait-hormuz': [
                { title: 'Oil Prices Surge as Tanker Seized Near Strait of Hormuz', description: 'Crude oil futures jumped 4% after IRGC naval vessels boarded and detained a Panamanian-flagged oil tanker in disputed waters near the Persian Gulf entrance.', url: 'https://www.bloomberg.com', source: 'Bloomberg', publishedAt: new Date(Date.now() - 1800000).toISOString(), urlToImage: null },
                { title: 'US Deploys Additional Mine-Sweepers to Persian Gulf', description: 'Pentagon confirms additional MCM vessels deployed as intelligence indicates Iranian Revolutionary Guard Corps mining preparations near Hormuz shipping lanes.', url: 'https://www.defensenews.com', source: 'Defense News', publishedAt: new Date(Date.now() - 5400000).toISOString(), urlToImage: null },
                { title: 'IRGC Naval Drills Signal Warning to Western Shipping', description: 'Iran\'s Revolutionary Guard Corps conducted large-scale naval exercises in the Strait of Hormuz, a message analysts interpret as a warning to US carrier presence.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 9000000).toISOString(), urlToImage: null },
            ],
            'iran-nuclear': [
                { title: 'IAEA: Iran Has Enough Fissile Material for Multiple Nuclear Weapons', description: 'UN nuclear watchdog report confirms Iran\'s enriched uranium stockpile has grown to historic highs, with breakout timeline now measured in days not months.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 2700000).toISOString(), urlToImage: null },
                { title: 'Iran Restricts IAEA Inspector Access to Key Sites', description: 'Tehran has denied international nuclear inspectors access to the Fordow enrichment facility, raising alarm among Western powers about transparency of the nuclear program.', url: 'https://www.bbc.com', source: 'BBC News', publishedAt: new Date(Date.now() - 8100000).toISOString(), urlToImage: null },
                { title: 'Nuclear Talks in Vienna Collapse After Iran Demands', description: 'Diplomatic efforts to revive the Iran nuclear deal have stalled after Tehran demanded removal of all Revolutionary Guard sanctions before agreeing to enrichment limits.', url: 'https://apnews.com', source: 'AP News', publishedAt: new Date(Date.now() - 12600000).toISOString(), urlToImage: null },
            ],
            'ukraine-russia': [
                { title: 'Russian Forces Advance in Zaporizhzhia as Ceasefire Talks Stall', description: 'Ukrainian military reports Russian armored units pushed 3km into contested territory overnight as peace negotiations in Istanbul remain deadlocked.', url: 'https://www.aljazeera.com', source: 'Al Jazeera', publishedAt: new Date(Date.now() - 4500000).toISOString(), urlToImage: null },
                { title: 'Ukraine Strikes Russian Fuel Depot Deep Inside Belgorod Region', description: 'Ukrainian drone forces conducted a long-range strike on a major Russian fuel logistics hub, disrupting supply lines to front-line units in the Kharkiv sector.', url: 'https://www.bbc.com', source: 'BBC News', publishedAt: new Date(Date.now() - 7200000).toISOString(), urlToImage: null },
                { title: 'NATO Announces Additional Artillery Package for Ukraine', description: 'Alliance defense ministers agreed on a new security assistance package including long-range artillery systems, following Ukraine\'s request for increased firepower.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 10800000).toISOString(), urlToImage: null },
                { title: 'Zelensky Calls for Emergency UN Security Council Session', description: 'Ukrainian President Volodymyr Zelensky requested an emergency UN Security Council meeting after evidence emerged of Russian forces targeting civilian infrastructure.', url: 'https://apnews.com', source: 'AP News', publishedAt: new Date(Date.now() - 14400000).toISOString(), urlToImage: null },
            ],
            'gaza': [
                { title: 'Gaza Ceasefire Negotiations Resume in Cairo', description: 'Egyptian and Qatari mediators resumed talks between Israeli officials and Hamas representatives, as both sides signal cautious openness to a new hostage-prisoner deal.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 3000000).toISOString(), urlToImage: null },
                { title: 'IDF Announces Expanded Operations in Northern Gaza', description: 'The Israel Defense Forces declared the start of a new ground offensive phase in northern Gaza, targeting remaining Hamas military infrastructure in the Jabalia camp area.', url: 'https://www.timesofisrael.com', source: 'Times of Israel', publishedAt: new Date(Date.now() - 6000000).toISOString(), urlToImage: null },
                { title: 'UN Agency Warns of Critical Food Shortages Across Gaza Strip', description: 'UNRWA officials warned that aid convoys continue to face access restrictions, with famine conditions now affecting large populations in southern and central Gaza.', url: 'https://www.aljazeera.com', source: 'Al Jazeera', publishedAt: new Date(Date.now() - 9000000).toISOString(), urlToImage: null },
            ],
            'red-sea': [
                { title: 'Houthi Missiles Strike Cargo Ship in Red Sea Corridor', description: 'Yemen\'s Houthi rebels claimed responsibility for a ballistic missile strike on a commercial vessel transiting the critical Bab-el-Mandeb strait, injuring two crew members.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 2400000).toISOString(), urlToImage: null },
                { title: 'US Warship Intercepts Houthi Drone Swarm Over Red Sea', description: 'The USS Carney intercepted a coordinated drone attack launched from Houthi-controlled territory targeting commercial shipping in the southern Red Sea.', url: 'https://www.defensenews.com', source: 'Defense News', publishedAt: new Date(Date.now() - 6000000).toISOString(), urlToImage: null },
                { title: 'Shipping Costs Triple as Carriers Divert Around Africa', description: 'Major container lines have extended rerouting around the Cape of Good Hope, with Suez Canal traffic down 60% as the Red Sea security crisis shows no signs of abating.', url: 'https://www.bloomberg.com', source: 'Bloomberg', publishedAt: new Date(Date.now() - 10800000).toISOString(), urlToImage: null },
            ],
            'taiwan-china': [
                { title: 'China PLA Conducts Record Incursions Into Taiwan ADIZ', description: 'Taiwan\'s defense ministry scrambled jets after 46 Chinese aircraft entered its air defense identification zone in the largest single-day incursion on record.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 3600000).toISOString(), urlToImage: null },
                { title: 'US Arms Sale to Taiwan Approved Despite Beijing Protest', description: 'The State Department approved a $500 million arms package for Taiwan including anti-ship missiles, prompting sharp condemnation from China\'s foreign ministry.', url: 'https://apnews.com', source: 'AP News', publishedAt: new Date(Date.now() - 7200000).toISOString(), urlToImage: null },
                { title: 'Taiwan Strait Tension: G7 Warns Against Unilateral Changes', description: 'G7 foreign ministers issued a joint statement calling on China to refrain from destabilizing actions in the Taiwan Strait, reaffirming their commitment to a free and open Indo-Pacific.', url: 'https://www.bbc.com', source: 'BBC News', publishedAt: new Date(Date.now() - 10800000).toISOString(), urlToImage: null },
            ],
            'world': [
                { title: 'Global Conflict Index Reaches 10-Year High as Multiple Wars Rage', description: 'A new geopolitical risk assessment found that simultaneous conflicts across the Middle East, Eastern Europe, and the Indo-Pacific have pushed global instability to levels not seen since 2015.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 1800000).toISOString(), urlToImage: null },
                { title: 'UN Security Council Divided Over Escalating Tensions in Three Theatres', description: 'Permanent members failed to agree on a coordinated response to simultaneous crises in Gaza, Ukraine, and the South China Sea, highlighting the limits of multilateral diplomacy.', url: 'https://www.aljazeera.com', source: 'Al Jazeera', publishedAt: new Date(Date.now() - 5400000).toISOString(), urlToImage: null },
                { title: 'Global Defense Spending Hits Record $2.4 Trillion in 2025', description: 'SIPRI data shows worldwide military expenditure surpassed $2.4 trillion this year, with the largest increases recorded in Europe, East Asia, and the Gulf states.', url: 'https://www.bloomberg.com', source: 'Bloomberg', publishedAt: new Date(Date.now() - 9000000).toISOString(), urlToImage: null },
                { title: 'Nuclear-Armed States Expand Arsenals as Arms Control Collapses', description: 'The Bulletin of Atomic Scientists warned that all nine nuclear-armed states are modernizing or expanding their arsenals, the first time this has occurred simultaneously since the Cold War.', url: 'https://www.bbc.com', source: 'BBC News', publishedAt: new Date(Date.now() - 12600000).toISOString(), urlToImage: null },
                { title: 'Refugee Crisis Deepens: 120 Million Displaced Worldwide', description: 'UNHCR data released this week shows the number of forcibly displaced people has reached a new record of 120 million, driven by ongoing conflicts in Sudan, Gaza, and Ukraine.', url: 'https://apnews.com', source: 'AP News', publishedAt: new Date(Date.now() - 16200000).toISOString(), urlToImage: null },
                { title: 'Energy Markets Roiled by Geopolitical Uncertainty Across Three Regions', description: 'Oil and gas futures swung sharply as traders weighed supply disruptions from conflicts in the Middle East, disruptions to Russian pipelines, and new sanctions regimes.', url: 'https://www.wsj.com', source: 'Wall Street Journal', publishedAt: new Date(Date.now() - 19800000).toISOString(), urlToImage: null },
                { title: 'Cyber Warfare: State-Sponsored Attacks Hit Critical Infrastructure', description: 'Government agencies in the US, EU, and allied nations reported a surge in state-sponsored cyberattacks targeting power grids, financial systems, and military networks.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: new Date(Date.now() - 23400000).toISOString(), urlToImage: null },
                { title: 'South China Sea: Philippines and China Clash Over Shoal Access', description: 'Tensions flared as Chinese coast guard vessels used water cannons to block Philippine supply boats heading to a grounded warship at Second Thomas Shoal.', url: 'https://www.aljazeera.com', source: 'Al Jazeera', publishedAt: new Date(Date.now() - 27000000).toISOString(), urlToImage: null },
                { title: 'Sudan Civil War Enters Third Year With No End in Sight', description: 'The conflict between Sudan\'s military and the Rapid Support Forces has killed tens of thousands and displaced over 10 million, making it one of the world\'s most severe humanitarian crises.', url: 'https://www.bbc.com', source: 'BBC News', publishedAt: new Date(Date.now() - 30600000).toISOString(), urlToImage: null },
            ],
        };
        return demos[topicKey] || demos['world'];
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
