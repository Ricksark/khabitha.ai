        // Constants
        const GALLERY_ITEMS = [
            "https://image.pollinations.ai/prompt/cyberpunk-vibe-city-neon?width=800&height=1000",
            "https://image.pollinations.ai/prompt/cosmic-voyager-astronaut-fantasy?width=800&height=800",
            "https://image.pollinations.ai/prompt/portrait-of-glowing-forest-deity?width=800&height=1100",
            "https://image.pollinations.ai/prompt/industrial-mecha-design-scifi?width=800&height=1000",
            "https://image.pollinations.ai/prompt/serene-zen-landscape-temple?width=800&height=800",
            "https://image.pollinations.ai/prompt/steampunk-invention-mechanical-dragon?width=800&height=1200",
            "https://image.pollinations.ai/prompt/mythical-vampire-lady-painting?width=800&height=800",
            "https://image.pollinations.ai/prompt/architecture-future-minimalist-desert?width=800&height=1000"
        ];

        let selectedRatio = "1:1";
        let sessionHistory = [];

        // DOM Setup
        window.addEventListener('DOMContentLoaded', () => {
            initGallery();
            initMarquee();
            loadSessionHistory();
        });

        function launchApp() {
            document.body.style.overflow = 'hidden';
            const app = document.getElementById('app-interface');
            app.style.display = 'flex';
            setTimeout(() => app.style.opacity = '1', 10);
        }

        function hideApp() {
            document.body.style.overflow = 'auto';
            const app = document.getElementById('app-interface');
            app.style.opacity = '0';
            setTimeout(() => app.style.display = 'none', 500);
        }

        function initGallery() {
            const gallery = document.getElementById('community-gallery');
            GALLERY_ITEMS.forEach(url => {
                const card = `
                <div class="relative glass rounded-2xl overflow-hidden group">
                    <img src="${url}" class="w-full h-auto transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                        <p class="text-xs font-mono text-slate-300">Prompt:</p>
                        <p class="text-sm italic">${url.split('/prompt/')[1].split('?')[0].replace(/-/g, ' ')}</p>
                    </div>
                </div>`;
                gallery.innerHTML += card;
            });
        }

        function initMarquee() {
            const m = document.getElementById('hero-marquee');
            GALLERY_ITEMS.forEach(url => {
                const div = `<img src="${url}" class="w-72 h-48 object-cover rounded-2xl glass transform hover:rotate-3 transition-all">`;
                m.innerHTML += div;
                m.innerHTML += div; // Duplicate for seamless scroll
            });
        }

        function setRatio(r) {
            selectedRatio = r;
            document.querySelectorAll('.ratio-btn').forEach(b => {
                b.classList.remove('active', 'border-primary/40', 'bg-primary/10');
            });
            document.querySelector(`[data-ratio="${r}"]`).classList.add('active', 'border-primary/40', 'bg-primary/10');
        }

        function magicEnhance() {
            const p = document.getElementById('prompt-input');
            const additions = ", masterpiece, 8k, extremely detailed, highly realistic, professional lighting, cinematic colors";
            if (!p.value.includes(additions)) {
                p.value += additions;
                p.classList.add('text-secondary');
            }
        }

        async function generateImage() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert("Please enter a vision to visualize!");
        return;
    }

    const model = document.getElementById('model-selector').value;

    // --- PRO CHECK ---
    // If user is selecting any Flux model and isn't Pro, stop them.
    const isFluxModel = model.toLowerCase().includes('flux');
    // We check the "Infinite" text or a subscription variable
    const isPro = (document.getElementById('gen-count').innerText.includes('INFINITY'));

    if (isFluxModel && !isPro) {
        alert("Premium Model Detected! Please redeem a PRO key in 'My Account' to use Black Forest Labs engines.");
        openPricing();
        return;
    }

    // Show Loader
    document.getElementById('placeholder').classList.add('hidden');
    document.getElementById('image-result-wrapper').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');

    // Dimensions
    let w = 1024, h = 1024;
    if (selectedRatio === '16:9') { w = 1280; h = 720; }
    if (selectedRatio === '9:16') { w = 720; h = 1280; }

    const seed = document.getElementById('image-seed').value === "-1" 
        ? Math.floor(Math.random() * 1000000) 
        : document.getElementById('image-seed').value;
                
    const style = document.getElementById('model-style').value;
    const fullPrompt = style ? `${style}, ${prompt}` : prompt;

    // API URL Building (Using Pollinations as the gateway)
    // Note: Pollinations acts as a proxy. If a model isn't natively 
    // supported by their hardware, it usually fallbacks to their best available Flux model.
    const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${w}&height=${h}&seed=${seed}&model=${model}&nologo=true&enhance=true`;

    try {
        const resultImg = document.getElementById('image-result');
        resultImg.src = finalUrl;
        
        resultImg.onload = () => {
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('image-result-wrapper').classList.remove('hidden');
            addToHistory(prompt, finalUrl);
        };
    } catch (err) {
        console.error(err);
        alert("The neural engine is overloaded. Try again in a moment.");
        document.getElementById('loader').classList.add('hidden');
    }
}

        function addToHistory(p, url) {
            const histItem = { prompt: p, url: url, timestamp: Date.now() };
            sessionHistory.unshift(histItem);
            if (sessionHistory.length > 8) sessionHistory.pop();
            
            saveSessionHistory();
            renderHistory();
        }

        function renderHistory() {
            const grid = document.getElementById('history-grid');
            grid.innerHTML = "";
            sessionHistory.forEach(item => {
                const el = document.createElement('div');
                el.className = "aspect-square rounded-lg glass overflow-hidden cursor-pointer hover:scale-105 transition-all";
                el.innerHTML = `<img src="${item.url}" class="w-full h-full object-cover">`;
                el.onclick = () => {
                    document.getElementById('placeholder').classList.add('hidden');
                    document.getElementById('image-result-wrapper').classList.remove('hidden');
                    document.getElementById('image-result').src = item.url;
                };
                grid.appendChild(el);
            });
        }

        async function downloadImage() {
            const url = document.getElementById('image-result').src;
            const image = await fetch(url);
            const imageBlog = await image.blob();
            const imageURL = URL.createObjectURL(imageBlog);

            const link = document.createElement('a');
            link.href = imageURL;
            link.download = `KhabithaAI-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function saveSessionHistory() {
            localStorage.setItem('aether_history', JSON.stringify(sessionHistory));
        }

        function loadSessionHistory() {
            const saved = localStorage.getItem('aether_history');
            if (saved) {
                sessionHistory = JSON.parse(saved);
                renderHistory();
            }
        }
      
      
      
      
      
      
      let isShowcaseOpen = false;

function toggleShowcase() {
    const panel = document.getElementById('showcase-panel');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-chat-icon');
    
    isShowcaseOpen = !isShowcaseOpen;
    
    if (isShowcaseOpen) {
        panel.classList.remove('translate-x-full');
        chatIcon.classList.add('opacity-0', 'rotate-90');
        closeIcon.classList.remove('opacity-0');
        closeIcon.classList.add('opacity-100');
    } else {
        panel.classList.add('translate-x-full');
        chatIcon.classList.remove('opacity-0', 'rotate-90');
        closeIcon.classList.remove('opacity-100');
        closeIcon.classList.add('opacity-0');
    }
}
      
      
      
document.getElementById('newsletter-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('newsletter-email');
    const status = document.getElementById('newsletter-status');
    const button = this.querySelector('button');
    
    // --- CONFIGURATION ---
    const TELEGRAM_TOKEN = "TELEGRAM_API_TOKEN"; // Replace with your Bot Token
    const CHAT_ID = "TELEGRAM_CHAT_ID";       // Replace with your Chat ID
    // ---------------------

    const email = emailInput.value;
    const message = `🚀 *New Subscriber on Khabitha AI* \n\n📧 Email: ${email}\n🕒 Time: ${new Date().toLocaleString()}`;

    // Visual Feedback
    button.disabled = true;
    status.innerText = "Processing...";
    status.className = "mt-4 text-xs italic text-primary";

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (response.ok) {
            status.innerText = "Success! You've been added to the list. ✨";
            status.className = "mt-4 text-xs italic text-green-400";
            emailInput.value = ""; // Clear input
        } else {
            throw new Error();
        }
    } catch (error) {
        status.innerText = "Error connecting to server. Please try again.";
        status.className = "mt-4 text-xs italic text-red-400";
    } finally {
        button.disabled = false;
    }
});
      
      
      
      
// Function to animate the counter
function animatePopularity() {
    const target = 198; // The number you want to reach
    const duration = 5000; // Animation duration in milliseconds (2 seconds)
    const counterElement = document.getElementById('popularity-count');
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        counterElement.innerText = Math.floor(progress * target);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

// Trigger animation when section is in view
const observerOptions = {
    threshold: 0.5 // Start when 50% of the element is visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animatePopularity();
            observer.unobserve(entry.target); // Run only once
        }
    });
}, observerOptions);

// Start observing the popularity section
document.addEventListener('DOMContentLoaded', () => {
    const targetSection = document.getElementById('popularity-count');
    if (targetSection) observer.observe(targetSection);
});
      
      
      
      
      
      
      
      
      
// ----------------------------------------------- mobile based navigation bat script ------------------------------------------------ //      
function toggleMobileMenu() {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    const isClosed = sidebar.classList.contains('translate-x-full');

    if (isClosed) {
        // Open
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    } else {
        // Close
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'auto'; // Restore scroll
    }
}      
      
      
      
      
 
      
      
      
      
      
let currentUser = null;

// 1. Handle Login
async function handleGoogleLogin() {
    try {
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        console.log("Logged in as:", currentUser.displayName);
        updateUI();
    } catch (error) {
        console.error("Login Failed:", error.message);
        alert("Login failed: " + error.message);
    }
}

// 2. Handle Logout
function handleLogout() {
    auth.signOut().then(() => {
        currentUser = null;
        hideApp(); // Close the app if they log out
        updateUI();
    });
}

// 3. Update UI based on Auth State
function updateUI() {
    const authControls = document.getElementById('auth-controls');
    
    if (currentUser) {
        authControls.innerHTML = `
            <div class="flex items-center gap-4">
                <button onclick="launchApp()" class="btn-gradient px-6 py-2.5 rounded-full text-white font-bold hidden md:block">Start Creating</button>
                
                <!-- Profile Menu Container -->
                <div class="relative">
                    <button onclick="toggleProfileMenu(event)" class="flex items-center focus:outline-none">
                        <img src="${currentUser.photoURL}" class="w-10 h-10 rounded-full border-2 border-primary/50 hover:border-primary transition-all p-0.5">
                    </button>

                    <!-- Dropdown Popup -->
                    <div id="profile-dropdown" class="absolute right-0 mt-3 w-48 glass-dark border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                        <div class="p-4 border-b border-white/5">
                            <p class="text-xs font-bold text-slate-400 truncate">${currentUser.displayName}</p>
                            <p class="text-[10px] text-slate-500 truncate">${currentUser.email}</p>
                        </div>
                        <div class="p-2">
					<button onclick="showAccountSection()" class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
					    <i class="ph ph-user-circle"></i> My Account
					</button>
					<button onclick="openSettings()" class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
					    <i class="ph ph-gear"></i> Settings
					</button>
                            <div class="h-px bg-white/5 my-1"></div>
                            <button onclick="handleLogout()" class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2">
                                <i class="ph ph-sign-out"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        authControls.innerHTML = `
            <button onclick="handleGoogleLogin()" class="btn-gradient px-6 py-2.5 rounded-full text-white font-bold flex items-center gap-2">
                <i class="ph-bold ph-google-logo"></i> Login to Create
            </button>
        `;
    }
}
// 4. Update launchApp to check for user
// REPLACE your existing launchApp function with this:
function launchApp() {
    if (!currentUser) {
        handleGoogleLogin(); // Force login if trying to access
        return;
    }
    document.body.style.overflow = 'hidden';
    const app = document.getElementById('app-interface');
    app.style.display = 'flex';
    setTimeout(() => app.style.opacity = '1', 10);
}

// 5. Check Auth State on Page Load
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
    } else {
        currentUser = null;
    }
    updateUI();
}); 
      
      
      
// Toggle the profile dropdown
function toggleProfileMenu(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && dropdown.classList.contains('active')) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    }
});
      
      
      
      
function showAccountSection() {
    if (!currentUser) return;

    // Populate data
    document.getElementById('acc-pfp').src = currentUser.photoURL;
    document.getElementById('acc-name').innerText = currentUser.displayName;
    document.getElementById('acc-email').innerText = currentUser.email;

    // Calculate total generations from saved history
    const history = JSON.parse(localStorage.getItem('aether_history') || '[]');
    document.getElementById('acc-total-gen').innerText = history.length;

    // Show Modal
    const modal = document.getElementById('account-modal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function hideAccountSection() {
    const modal = document.getElementById('account-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}
      
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideAccountSection();
    }
});      
      
// Settings Logic
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Fill user info if logged in
    if (currentUser) {
        document.getElementById('set-name').value = currentUser.displayName;
        document.getElementById('set-email').value = currentUser.email;
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function switchTab(tabId) {
    // Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white', 'active');
        btn.classList.add('hover:bg-white/5', 'text-slate-400');
    });
    event.currentTarget.classList.add('bg-primary', 'text-white', 'active');
    event.currentTarget.classList.remove('hover:bg-white/5', 'text-slate-400');

    // Update Content
    document.querySelectorAll('.setting-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    // Update Title
    const titles = {
        'general': 'General Settings',
        'studio': 'Studio Preferences',
        'api': 'Developer API'
    };
    document.getElementById('tab-title').querySelector('h4').innerText = titles[tabId];
}      

      
      
      
      
      
      
      
// --------------------------------------<Pricing Modal Logic>------------------------------------------------------ //
function openPricing() {
    document.getElementById('pricing-modal').classList.remove('hidden');
    document.getElementById('pricing-modal').classList.add('flex');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closePricing() {
    document.getElementById('pricing-modal').classList.add('hidden');
    document.getElementById('pricing-modal').classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// API Docs Modal Logic
function openDocs() {
    document.getElementById('api-docs-modal').classList.remove('hidden');
    document.getElementById('api-docs-modal').classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeDocs() {
    document.getElementById('api-docs-modal').classList.add('hidden');
    document.getElementById('api-docs-modal').classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// Add Escape key to close both
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePricing();
        closeDocs();
    }
}); 
      
      
// Upstash Redis Configuration
const REDIS_URL = "RESET_URL";
const REDIS_TOKEN = "API_TOKEN";
const ONE_MONTH_SECONDS = 2592000; // 30 Days

async function redisQuery(command, ...args) {
    const url = `${REDIS_URL}/${command}/${args.join('/')}`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    return await response.json();
}

// Generate 64-bit Hex Code
function generateSubCode() {
    return Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
      
      
// ---------------------------------------------- Admin Configuration ---------------------------------------------------------------
const ADMIN_USER = "ricksarkar260@gmail.com"; 
const ADMIN_PASS = "kabita@2005"; // Change this password

// Toggle Admin with Shift + A
window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'A') {
        document.getElementById('admin-login-modal').classList.remove('hidden');
        document.getElementById('admin-login-modal').classList.add('flex');
    }
});

function closeAdmin() {
    document.getElementById('admin-login-modal').classList.add('hidden');
}

function attemptAdminLogin() {
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;
    if(u === ADMIN_USER && p === ADMIN_PASS) {
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('flex');
        loadKeys();
    } else {
        alert("Access Denied.");
    }
}

// --- KEY GENERATION (1 MONTH) ---
async function createNewKey() {
    const key = generateSubCode();
    // Save to Redis key pool (no expiry for the unused key)
    await redisQuery("SET", `pool:${key}`, "PRO");
    
    document.getElementById('key-display').classList.remove('hidden');
    document.getElementById('key-string').innerText = key;
    loadKeys();
}

async function loadKeys() {
    const list = document.getElementById('admin-key-list');
    const result = await redisQuery("KEYS", "pool:*");
    const keys = result.result || [];
    
    list.innerHTML = keys.length ? "" : "<p class='text-slate-600'>No unused keys found.</p>";
    keys.forEach(k => {
        const cleanKey = k.replace("pool:", "");
        list.innerHTML += `
            <div class="flex justify-between items-center glass p-4 rounded-xl border-white/5">
                <code class="text-primary font-bold">${cleanKey}</code>
                <button onclick="deleteKey('${k}')" class="text-red-400 hover:text-red-500"><i class="ph ph-trash"></i></button>
            </div>
        `;
    });
}

async function deleteKey(k) {
    await redisQuery("DEL", k);
    loadKeys();
}

// --- USER REDEMPTION (SET 1 MONTH VALIDITY) ---
async function redeemSubscription() {
    if(!currentUser) return alert("Please Login First!");
    
    const input = document.getElementById('redeem-input');
    const code = input.value.trim().toUpperCase();
    
    // Check if key exists in pool
    const check = await redisQuery("GET", `pool:${code}`);
    
    if(check.result === "PRO") {
        // 1. Delete from unused pool
        await redisQuery("DEL", `pool:${code}`);
        
        // 2. Set user status with 1 Month (30 days) EXPIRE
        // SET user:UID PRO EX seconds
        await redisQuery("SET", `active_sub:${currentUser.uid}`, "PRO", "EX", ONE_MONTH_SECONDS);
        
        alert("1 MONTH PRO ACTIVATED! Your models are now unlocked.");
        location.reload();
    } else {
        alert("Invalid or Expired Code.");
    }
}
      
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        // Check Redis for active 1-month sub
        const status = await redisQuery("GET", `active_sub:${user.uid}`);
        if(status.result === "PRO") {
            // Unlock flux/pro models
            document.querySelectorAll('#model-selector option').forEach(opt => {
                opt.disabled = false;
            });
            console.log("Subscription Active: 1 Month Pro Status");
        }
    } else {
        currentUser = null;
    }
    updateUI();
}); 
      

      
      
      
      
// -------------------------------------------- ROBUST ADMIN TRIGGER -----------------------------------------------------
window.addEventListener('keydown', function(e) {
    // 1. Ignore if you are typing in the Prompt Input or any other text field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // However, if you press Shift + Alt + A inside an input, it will still work
        if (!(e.shiftKey && e.altKey && e.key.toLowerCase() === 'a')) {
            return;
        }
    }

    // 2. Trigger on Shift + A (Case Insensitive)
    if (e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault(); // Stop any default browser action
        const adminModal = document.getElementById('admin-login-modal');
        
        if (adminModal) {
            console.log("Admin Trigger Detected: Opening Modal...");
            adminModal.classList.remove('hidden');
            adminModal.classList.add('flex');
            // Auto-focus the username field
            setTimeout(() => document.getElementById('admin-user').focus(), 100);
        } else {
            console.error("Admin Modal HTML not found in document!");
        }
    }
});

// Function to close it
function closeAdmin() {
    const modal = document.getElementById('admin-login-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}      
      
  
   // -------------------------------------------- Custom Cursor Logic --------------------------------------------------
if (window.matchMedia("(pointer: fine)").matches) {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Show cursors on first movement
        dot.style.opacity = "1";
        outline.style.opacity = "1";

        // Update dot immediately
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        // Animate outline with a slight delay (smooth follow)
        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Add scaling effect when hovering over interactive elements
    const interactiveElements = 'a, button, input, select, .ratio-btn, .glass';
    document.querySelectorAll(interactiveElements).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = "0";
        outline.style.opacity = "0";
    });
}
 
   // --- PRIVATE ACCESS CONFIG ---
const ALLOWED_EMAILS = ["ricksarkar260@gmail.com", "priyangshus89@gmail.com", "anishchakrabrty567@gmail.com"];
const LOCK_EXPIRY_DATE = new Date("2026-08-18T23:59:59");

auth.onAuthStateChanged(async (user) => {
    const lockScreen = document.getElementById('private-lock');
    const lockError = document.getElementById('lock-error');
    const now = new Date();

    // 1. Check if the restriction date has passed
    if (now > LOCK_EXPIRY_DATE) {
        if(lockScreen) lockScreen.style.display = 'none';
        // Continue with normal app logic...
    } else {
        // 2. Date is still active, check authentication
        if (user) {
            if (ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
                // USER IS AUTHORIZED
                currentUser = user;
                if(lockScreen) lockScreen.style.display = 'none';
                console.log("Developer Access Granted:", user.email);
            } else {
                // LOGGED IN BUT NOT AUTHORIZED
                currentUser = null;
                if(lockError) lockError.classList.remove('hidden');
                // Optional: Logout the unauthorized user automatically
                // auth.signOut(); 
            }
        } else {
            // NOT LOGGED IN
            currentUser = null;
            if(lockScreen) lockScreen.style.display = 'flex';
        }
    }
    
    // Call your existing UI update function
    updateUI();
});
         
// 1. Block Right-Click Context Menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

// 2. Block Inspect Element Shortcuts
document.addEventListener('keydown', function(e) {
    // Block F12
    if (e.keyCode == 123) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        e.preventDefault();
        return false;
    }
}, false);


  // YOUR FIREBASE CONFIGURATION (Paste from Step 1.7)
  const firebaseConfig = {
    apiKey: "AIzaSyAVOi-tv-g5GzIZzRVbAj7YhfB2jWghcI0",
    authDomain: "khabitha-ai.firebaseapp.com",
    projectId: "khabitha-ai",
    storageBucket: "khabitha-ai.firebasestorage.app",
    messagingSenderId: "95773093621",
    appId: "1:95773093621:web:7dc83064ebea5207a3dfbc"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
