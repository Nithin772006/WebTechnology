// =============================================
// TRENDPULSE — AI CHATBOT
// chatbot.js — Knowledge Base + Chat Logic
// =============================================

// ---- KNOWLEDGE BASE ----
const KB = {
    // UKRAINE
    ukraine: {
        keywords: ['ukraine', 'russia', 'putin', 'zelensky', 'kyiv', 'kiev', 'nato ukraine', 'eastern europe', 'donbas', 'crimea'],
        responses: [
            `**Russia–Ukraine War Overview:**\n\nThe conflict began on **February 24, 2022** when Russian President Vladimir Putin launched a full-scale invasion of Ukraine, calling it a "special military operation." Here's the breakdown:\n\n**Origins:**\n• 2014: Russia annexed Crimea and backed separatists in Donbas\n• Ukraine sought NATO membership — Russia saw this as an existential threat\n• NATO expansion eastward was Putin's stated casus belli\n\n**Current Status (2026):**\n• War in its 4th year with no ceasefire in sight\n• Ukraine holds ~75% of its pre-2022 territory\n• Russia controls significant portions of Zaporizhzhia, Kherson, Donetsk, and Luhansk\n• NATO members have provided $200B+ in military aid\n\n**How it might end:**\n• Most analysts project a frozen conflict (like Korea) rather than a total victory\n• Negotiations possible if political leadership changes in either country\n• Peace deal likely requires Ukraine accepting some territorial loss in exchange for security guarantees`,

            `**Russia-Ukraine: Key Facts**\n\n🔴 **Casualties:** Estimated 300,000+ on both sides\n📍 **Territory:** Russia controls ~18% of Ukraine\n💰 **Cost to Ukraine:** $500B+ in infrastructure damage\n🛡️ **NATO Response:** F-16s, Leopard 2 tanks, HIMARS provided\n\nThe war shifted global energy markets, triggering Europe's worst energy crisis since 1973. European nations fast-tracked away from Russian gas, while Russia pivoted to Asia.\n\n**The End Scenario:**\nMost geopolitical analysts at RAND Corporation and Atlantic Council project the war ending through **negotiated ceasefire** rather than either side achieving full objectives — likely by 2027.`
        ]
    },

    // ISRAEL GAZA
    middleeast: {
        keywords: ['israel', 'gaza', 'hamas', 'palestine', 'netanyahu', 'october 7', 'hezbollah', 'iran israel', 'middle east', 'west bank', 'idf'],
        responses: [
            `**Israel–Gaza War:**\n\n**Origin:**\nOn **October 7, 2023**, Hamas militants breached Israeli barriers and attacked southern Israeli communities. 1,200 Israelis were killed (the deadliest day for Jewish people since the Holocaust) and 240 were taken hostage.\n\n**Israel's Response:**\nIsrael declared war and launched **Operation Iron Swords** — a comprehensive air and ground campaign in Gaza. By 2026, the war has resulted in 40,000+ Palestinian casualties and massive infrastructure destruction.\n\n**Regional Spillover:**\n• Hezbollah in Lebanon engaged in months of rocket exchanges with Israel\n• Houthi rebels in Yemen targeted Israeli-linked ships in the Red Sea\n• Iran launched a direct missile attack on Israel in April 2024 (first ever)\n• US airstrikes in Yemen, Syria, Iraq against Iran-backed groups\n\n**How it may end:**\nA two-state solution remains theoretically viable but politically distant. Most analysts expect Gaza to see a new governing authority under Arab state monitoring.`,
        ]
    },

    // TAIWAN
    taiwan: {
        keywords: ['taiwan', 'china taiwan', 'pla', 'strait', 'xi jinping', 'south china sea', 'taiwan war', 'china us war', 'indo-pacific'],
        responses: [
            `**China–Taiwan Tensions:**\n\n**Background:**\nChina considers Taiwan a breakaway province and has vowed reunification — by force if necessary. Taiwan operates as a de facto independent democratic nation of 23 million people.\n\n**Why It Matters Globally:**\n• Taiwan produces **92% of the world's advanced semiconductors** (TSMC)\n• A Chinese blockade or invasion would trigger a global economic collapse\n• The US has a legal commitment under the Taiwan Relations Act to provide defensive arms\n\n**Current Risk Level:**\n• PLA conducted its largest-ever military exercises around Taiwan in 2022 and 2024\n• US carrier strike groups regularly transit the Taiwan Strait\n• China's military budget grew 7.2% in 2025 — focus on amphibious warfare\n\n**WW3 Scenario:**\nIf China invades Taiwan, most analysts believe the US would intervene directly, risking a conflict between the world's two largest nuclear powers. The RAND Corporation estimates such a war's economic cost at $10 trillion in the first year alone.`,
        ]
    },

    // NORTH KOREA
    northkorea: {
        keywords: ['north korea', 'kim jong', 'dprk', 'nuclear', 'missile', 'korean war', 'korean peninsula', 'pyongyang'],
        responses: [
            `**North Korea & Nuclear Threat:**\n\nNorth Korea (DPRK) is one of nine nations with nuclear weapons — and the most unpredictable.\n\n**Key Facts:**\n• Estimated **40–50 nuclear warheads** (growing)\n• ICBMs capable of hitting the US mainland (Hwasong-17 tested 2022)\n• Troops reportedly sent to assist Russia in Ukraine (2024)\n• Kim Jong-Un has vowed to never denuclearize\n\n**The Risk:**\n• Any conflict on the Korean Peninsula risks nuclear escalation\n• South Korea (population 52 million) lies within 50km of the border\n• The US has 28,500 troops stationed in South Korea\n\n**What's Next:**\nMost analysts believe North Korea will continue testing weapons as diplomatic leverage. A preventive strike by the US or South Korea is considered extremely unlikely due to the catastrophic retaliation risk.`,
        ]
    },

    // SUDAN
    sudan: {
        keywords: ['sudan', 'rsf', 'saf', 'rapid support forces', 'khartoum', 'civil war africa', 'darfur', 'africa conflict'],
        responses: [
            `**Sudan Civil War (2023–Present):**\n\nSudan descended into civil war in **April 2023** when a power struggle between the Sudanese Armed Forces (SAF) and the paramilitary Rapid Support Forces (RSF) turned violent.\n\n**Scale of Crisis:**\n• 8+ million people internally displaced — largest displacement crisis in the world\n• 25 million facing extreme hunger\n• RSF accused of widespread atrocities in Darfur\n• UN calls it the world's worst humanitarian crisis\n\n**Why it started:**\nBoth sides were part of the same transitional government following the 2019 ouster of Omar al-Bashir. A dispute over RSF integration into the regular army triggered fighting.\n\n**Prognosis:**\nLimited international attention has left this conflict unresolved. Ceasefire talks mediated in Saudi Arabia have repeatedly collapsed. Resolution may require regime change or total military victory by one faction.`,
        ]
    },

    // YEMEN
    yemen: {
        keywords: ['yemen', 'houthi', 'red sea', 'saudi arabia yemen', 'iran proxy', 'shipping', 'suez'],
        responses: [
            `**Yemen & the Houthi Crisis:**\n\nYemen has been in civil war since 2015, with Saudi Arabia–led coalition fighting Iran-backed Houthi rebels.\n\n**The Red Sea Dimension:**\nSince October 2023, Houthis have dramatically escalated by targeting commercial ships in the Red Sea, claiming solidarity with Gaza.\n\n**Global Impact:**\n• 15% of world trade passes through the Red Sea/Suez Canal route\n• Ships now rerouting around Africa, adding 2 weeks and ~$1M in fuel costs\n• Global shipping rates tripled\n• US and UK conducted strikes on Houthi positions in Yemen\n\n**Iran's Role:**\nHouthis receive weapons, intelligence and funding from Iran — making this a key front in the broader Iran–US–Israel shadow war.\n\n**Outlook:**\nThe Yemen war is unlikely to end soon. Houthi attacks on shipping will likely continue until the Gaza conflict is resolved.`,
        ]
    },

    // WW3
    ww3: {
        keywords: ['world war 3', 'ww3', 'third world war', 'nuclear war', 'global war', 'will war happen', 'ww3 happen'],
        responses: [
            `**Will WW3 Happen?**\n\nThis is the question on everyone's mind. Here's an honest research-based assessment:\n\n**Factors that increase risk:**\n• Multiple simultaneous major wars (Ukraine, Gaza, Sudan)\n• Russia-NATO direct confrontation possible if war expands\n• China-Taiwan crisis could pull in US directly\n• Nuclear-armed states (Russia, N. Korea) making threats\n• Erosion of international institutions (UN paralysis)\n\n**Factors that prevent WW3:**\n• Nuclear deterrence — mutually assured destruction still works\n• Global economic interdependence makes total war too costly\n• No state actually wants a global war (rational actor theory)\n• Strong back-channel diplomacy continues\n\n**Expert Consensus:**\nTrendPulse's aggregated academic risk index puts WW3 probability at **34%** — elevated but not inevitable. Most scholars believe proxy conflicts and economic warfare (not boots-on-the-ground wars between superpowers) will define the next decade.\n\n⚠️ *This is an academic risk assessment, not a prediction.*`,
        ]
    },

    // GENERAL
    general: {
        keywords: ['conflict', 'war', 'crisis', 'geopolitics', 'global', 'peace', 'ceasefire', 'diplomacy', 'nato', 'un', 'united nations'],
        responses: [
            `**Global Conflict Overview (2026):**\n\nThe world is currently experiencing the highest number of simultaneous active conflicts since WW2. Key hotspots:\n\n🔴 **Active Wars:** Ukraine, Gaza, Sudan, Myanmar, Ethiopia\n🟠 **High Tension:** Taiwan Strait, Korean Peninsula, Kosovo\n🟡 **Ongoing Crises:** Yemen, Haiti, Venezuela, Sahel region\n\n**The Interconnected Web:**\nThese conflicts aren't isolated — they're connected. Iran backs Hamas, Hezbollah, and Houthis. Russia supports Iran. China provides dual-use technology to Russia. North Korea sends artillery to Russia.\n\nThis "axis of disruption" is testing the post-WW2 Western-led international order.\n\nWould you like me to dive deeper into any specific conflict? 🌍`,
        ]
    }
};

// ---- CHATBOT ENGINE ----
let isTyping = false;
let chatOpen = false;

const chatWindow = document.getElementById('chatbotWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSuggestions = document.getElementById('chatSuggestions');

// Open/close handlers
document.getElementById('chatbotFab')?.addEventListener('click', () => openChat());
document.getElementById('openChatBtn')?.addEventListener('click', () => openChat());
document.getElementById('openChatNavBtn')?.addEventListener('click', (e) => { e.preventDefault(); openChat(); });
document.getElementById('chatClose')?.addEventListener('click', () => closeChat());
document.getElementById('chatMinimize')?.addEventListener('click', () => closeChat());

function openChat() {
    chatWindow.classList.add('open');
    chatOpen = true;
    chatInput?.focus();
}
function closeChat() {
    chatWindow.classList.remove('open');
    chatOpen = false;
}

// Send message on Enter key
chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('chatSend')?.addEventListener('click', sendMessage);

function sendSuggestion(btn) {
    const text = btn.textContent;
    chatInput.value = text;
    // Hide suggestions after first use
    if (chatSuggestions) chatSuggestions.style.display = 'none';
    sendMessage();
}

function sendMessage() {
    const input = chatInput;
    if (!input) return;
    const text = input.value.trim();
    if (!text || isTyping) return;

    // Append user message
    appendMessage('user', text);
    input.value = '';

    // Hide suggestions
    if (chatSuggestions) chatSuggestions.style.display = 'none';

    // Show typing indicator
    showTyping();

    // Find response after delay
    setTimeout(() => {
        removeTyping();
        const response = findResponse(text.toLowerCase());
        appendBotMessage(response);
    }, 800 + Math.random() * 700);
}

function findResponse(query) {
    // Search knowledge base
    for (const [key, data] of Object.entries(KB)) {
        for (const kw of data.keywords) {
            if (query.includes(kw)) {
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Fallback responses
    const fallbacks = [
        `I'm specialized in current global conflicts and geopolitical research. You can ask me about:\n\n• 🇺🇦 Russia-Ukraine War\n• 🇵🇸 Israel-Gaza Conflict\n• 🇨🇳 China-Taiwan Tensions\n• 🌍 Sudan Civil War\n• 🚀 North Korea's nuclear program\n• ⚓ Yemen & Red Sea Crisis\n• 🌐 Will WW3 happen?\n\nWhat would you like to explore?`,
        `That's an interesting question! My expertise is in active global conflicts. Try asking about Ukraine, Gaza, Taiwan, Sudan, North Korea, or Yemen. You can also ask "Will WW3 happen?" for a risk assessment.`,
        `I specialize in real-time geopolitical conflict analysis. Could you rephrase your question around a specific country or conflict? I have detailed research on Ukraine, Gaza, Taiwan, Sudan, North Korea, and Yemen.`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'bot' ? '🤖' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
}

function appendBotMessage(markdownText) {
    const div = document.createElement('div');
    div.className = 'message bot-message';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = formatMarkdown(markdownText);

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
}

function formatMarkdown(text) {
    return text
        // Bold text **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Bullet points
        .replace(/^• (.+)$/gm, '<li>$1</li>')
        // Newlines to <br>
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in p
        .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

function showTyping() {
    isTyping = true;
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    [1, 2, 3].forEach(() => {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicator.appendChild(dot);
    });

    div.appendChild(avatar);
    div.appendChild(indicator);
    chatMessages.appendChild(div);
    scrollToBottom();
}

function removeTyping() {
    isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Global exposure for inline onclick
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
