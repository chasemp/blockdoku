import{G as c,P as l}from"./install-B2AQisTF.js";/* empty css             */class d{constructor(){this.storage=new c,this.currentTheme="wood",this.currentDifficulty="normal",this.settings=this.storage.loadSettings(),this.pwaInstallManager=null,this.init()}init(){this.loadSettings(),this.setupEventListeners(),this.updateUI(),this.initializePWA()}initializePWA(){try{this.pwaInstallManager=new l,console.log("PWA Install Manager initialized in settings")}catch(t){console.error("Failed to initialize PWA Install Manager:",t)}}loadSettings(){this.currentTheme=this.settings.theme||"wood",this.currentDifficulty=this.settings.difficulty||"normal",this.applyTheme(this.currentTheme),this.loadEffectsSettings()}loadEffectsSettings(){const t=document.getElementById("sound-enabled");t&&(t.checked=this.settings.soundEnabled===!0);const e=document.getElementById("animations-enabled");e&&(e.checked=this.settings.animationsEnabled!==!1);const s=document.getElementById("particles-enabled");s&&(s.checked=this.settings.particlesEnabled!==!1);const a=document.getElementById("haptic-enabled");a&&(a.checked=this.settings.hapticEnabled!==!1)}setupEventListeners(){document.querySelectorAll(".nav-item").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault(),this.showSection(e.dataset.section)})}),document.querySelectorAll(".theme-option").forEach(e=>{e.addEventListener("click",s=>{this.selectTheme(s.currentTarget.dataset.theme)})}),document.querySelectorAll(".difficulty-option").forEach(e=>{e.addEventListener("click",s=>{this.selectDifficulty(s.currentTarget.dataset.difficulty)})}),document.getElementById("enable-hints").addEventListener("change",e=>{this.updateSetting("enableHints",e.target.checked)}),document.getElementById("enable-timer").addEventListener("change",e=>{this.updateSetting("enableTimer",e.target.checked)}),document.getElementById("enable-undo").addEventListener("change",e=>{this.updateSetting("enableUndo",e.target.checked)}),document.getElementById("sound-enabled").addEventListener("change",e=>{this.updateSetting("soundEnabled",e.target.checked)}),document.getElementById("animations-enabled").addEventListener("change",e=>{this.updateSetting("animationsEnabled",e.target.checked)}),document.getElementById("auto-save").addEventListener("change",e=>{this.updateSetting("autoSave",e.target.checked)}),document.getElementById("show-points").addEventListener("change",e=>{this.updateSetting("showPoints",e.target.checked),this.updateBlockPointsDisplay()}),document.getElementById("particles-enabled").addEventListener("change",e=>{this.updateSetting("particlesEnabled",e.target.checked)}),document.getElementById("haptic-enabled").addEventListener("change",e=>{this.updateSetting("hapticEnabled",e.target.checked)});const t=document.getElementById("share-button");t&&t.addEventListener("click",()=>{this.shareGame()})}showSection(t){document.querySelectorAll(".nav-item").forEach(e=>{e.classList.remove("active")}),document.querySelector(`[data-section="${t}"]`).classList.add("active"),document.querySelectorAll(".settings-section").forEach(e=>{e.classList.remove("active")}),document.getElementById(`${t}-section`).classList.add("active"),t==="scores"&&this.loadHighScores()}selectTheme(t){this.currentTheme=t,this.applyTheme(t),this.updateThemeUI(),this.saveSettings()}applyTheme(t){const e=document.getElementById("theme-css");e.href=`css/themes/${t}.css`}selectDifficulty(t){this.currentDifficulty=t,this.updateDifficultyUI(),this.saveSettings()}updateSetting(t,e){this.settings[t]=e,this.saveSettings()}updateUI(){this.updateThemeUI(),this.updateDifficultyUI(),this.updateGameSettingsUI()}updateThemeUI(){document.querySelectorAll(".theme-option").forEach(t=>{t.classList.remove("selected"),t.dataset.theme===this.currentTheme&&t.classList.add("selected")})}updateDifficultyUI(){document.querySelectorAll(".difficulty-option").forEach(t=>{t.classList.remove("selected"),t.dataset.difficulty===this.currentDifficulty&&t.classList.add("selected")})}updateGameSettingsUI(){document.getElementById("enable-hints").checked=this.settings.enableHints||!1,document.getElementById("enable-timer").checked=this.settings.enableTimer||!1,document.getElementById("enable-undo").checked=this.settings.enableUndo||!1,document.getElementById("sound-enabled").checked=this.settings.soundEnabled===!0,document.getElementById("animations-enabled").checked=this.settings.animationsEnabled!==!1,document.getElementById("particles-enabled").checked=this.settings.particlesEnabled!==!1,document.getElementById("haptic-enabled").checked=this.settings.hapticEnabled!==!1,document.getElementById("auto-save").checked=this.settings.autoSave!==!1,document.getElementById("show-points").checked=this.settings.showPoints||!1}updateBlockPointsDisplay(){const t=this.settings.showPoints||!1;document.querySelectorAll(".block-info").forEach(s=>{t?s.classList.add("show-points"):s.classList.remove("show-points")})}loadHighScores(){const t=document.getElementById("high-scores-list"),e=document.getElementById("statistics-display"),s=this.storage.getHighScores(),a=this.storage.loadStatistics();s.length===0?t.innerHTML="<p>No high scores yet. Play a game to set your first record!</p>":t.innerHTML=s.map((n,i)=>`
                <div class="score-item">
                    <div class="rank">#${i+1}</div>
                    <div class="score-value">${n.score}</div>
                    <div class="score-details">Level ${n.level} • ${new Date(n.date).toLocaleDateString()}</div>
                </div>
            `).join(""),e.innerHTML=`
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${a.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${a.totalScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${a.bestScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Lines:</span>
                <span class="stat-value">${a.totalLines}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Combo:</span>
                <span class="stat-value">${a.maxCombo}</span>
            </div>
        `}saveSettings(){const t={...this.settings,theme:this.currentTheme,difficulty:this.currentDifficulty};this.storage.saveSettings(t)}shareGame(){const t="https://blockdoku.523.life",e="Blockdoku - A Progressive Web App Puzzle Game";navigator.share?navigator.share({title:e,text:"Check out this awesome Blockdoku puzzle game!",url:t}).catch(a=>{console.log("Error sharing:",a),this.fallbackShare(t,e)}):this.fallbackShare(t,e)}fallbackShare(t,e){navigator.clipboard.writeText(t).then(()=>{this.showNotification("Game URL copied to clipboard!")}).catch(()=>{alert(`Share this game: ${t}`)})}showNotification(t){const e=document.createElement("div");e.style.cssText=`
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color, #007bff);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `,e.textContent=t;const s=document.createElement("style");s.textContent=`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,document.head.appendChild(s),document.body.appendChild(e),setTimeout(()=>{e.remove(),s.remove()},3e3)}}document.addEventListener("DOMContentLoaded",()=>{new d});
