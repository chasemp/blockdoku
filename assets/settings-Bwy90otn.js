import"./wood-B4vXo_re.js";import{G as m,C as g,S as f,P as p}from"./sound-manager-DkggOzQ2.js";import{b as h}from"./build-info-Dwp5dZmk.js";class y{constructor(){this.storage=new m,this.currentTheme="wood",this.currentDifficulty="normal",this.settings=this.storage.loadSettings(),this.pwaInstallManager=null,this.confirmationDialog=new g,this.soundManager=new f,this.init()}init(){this.loadSettings(),this.setupEventListeners(),this.updateUI(),this.updateBuildInfo(),this.initializePWA()}initializePWA(){try{this.pwaInstallManager=new p,console.log("PWA Install Manager initialized in settings")}catch(e){console.error("Failed to initialize PWA Install Manager:",e)}}loadSettings(){this.currentTheme=this.settings.theme||"wood",this.currentDifficulty=this.settings.difficulty||"normal",this.applyTheme(this.currentTheme),this.loadEffectsSettings(),this.updateDifficultyUI()}loadEffectsSettings(){const e=document.getElementById("sound-enabled");e&&(e.checked=this.settings.soundEnabled===!0);const t=document.getElementById("sound-enabled-sounds-section");t&&(t.checked=this.settings.soundEnabled===!0);const n=document.getElementById("animations-enabled");n&&(n.checked=this.settings.animationsEnabled!==!1);const c=document.getElementById("particles-enabled");c&&(c.checked=this.settings.particlesEnabled!==!1);const l=document.getElementById("haptic-enabled");l&&(l.checked=this.settings.hapticEnabled!==!1);const d=document.getElementById("enable-hints");d&&(d.checked=this.settings.enableHints===!0);const a=document.getElementById("enable-timer");a&&(a.checked=this.settings.enableTimer===!0);const s=document.getElementById("auto-save");s&&(s.checked=this.settings.autoSave!==!1);const o=document.getElementById("show-points");o&&(o.checked=this.settings.showPoints===!0);const i=document.getElementById("show-high-score");i&&(i.checked=this.settings.showHighScore===!0);const r=document.getElementById("combo-streak"),u=document.getElementById("combo-cumulative");r&&u&&((this.settings.comboDisplayMode||"cumulative")==="cumulative"?u.checked=!0:r.checked=!0)}setupEventListeners(){document.querySelectorAll(".nav-item").forEach(s=>{const o=i=>{i.preventDefault(),this.showSection(s.dataset.section)};s.addEventListener("click",o),s.addEventListener("touchstart",i=>{i.preventDefault(),o(i)},{passive:!1})}),document.querySelectorAll(".theme-option").forEach(s=>{const o=i=>{this.selectTheme(i.currentTarget.dataset.theme)};s.addEventListener("click",o),s.addEventListener("touchstart",i=>{i.preventDefault(),o(i)},{passive:!1})}),document.querySelectorAll(".difficulty-option").forEach(s=>{const o=async i=>{await this.selectDifficulty(i.currentTarget.dataset.difficulty)};s.addEventListener("click",o),s.addEventListener("touchstart",async i=>{i.preventDefault(),await o(i)},{passive:!1})}),document.getElementById("enable-hints").addEventListener("change",s=>{this.updateSetting("enableHints",s.target.checked)}),document.getElementById("enable-timer").addEventListener("change",s=>{this.updateSetting("enableTimer",s.target.checked)}),document.getElementById("sound-enabled").addEventListener("change",s=>{this.updateSetting("soundEnabled",s.target.checked);const o=document.getElementById("sound-enabled-sounds-section");o&&(o.checked=s.target.checked)});const e=document.getElementById("sound-enabled-sounds-section");e&&e.addEventListener("change",s=>{this.updateSetting("soundEnabled",s.target.checked);const o=document.getElementById("sound-enabled");o&&(o.checked=s.target.checked)}),document.getElementById("animations-enabled").addEventListener("change",s=>{this.updateSetting("animationsEnabled",s.target.checked)}),document.getElementById("auto-save").addEventListener("change",s=>{this.updateSetting("autoSave",s.target.checked)}),document.getElementById("show-points").addEventListener("change",s=>{this.updateSetting("showPoints",s.target.checked),this.updateBlockPointsDisplay()});const t=document.getElementById("show-high-score");t&&t.addEventListener("change",s=>{this.updateSetting("showHighScore",s.target.checked)});const n=document.getElementById("combo-streak"),c=document.getElementById("combo-cumulative");n&&c&&(n.addEventListener("change",s=>{s.target.checked&&this.updateSetting("comboDisplayMode","streak")}),c.addEventListener("change",s=>{s.target.checked&&this.updateSetting("comboDisplayMode","cumulative")})),document.getElementById("particles-enabled").addEventListener("change",s=>{this.updateSetting("particlesEnabled",s.target.checked)}),document.getElementById("haptic-enabled").addEventListener("change",s=>{this.updateSetting("hapticEnabled",s.target.checked)});const l=document.getElementById("share-button");l&&l.addEventListener("click",()=>{this.shareGame()});const d=document.getElementById("share-scores-button");d&&d.addEventListener("click",()=>{this.shareHighScores()});const a=document.getElementById("reset-stats");a&&a.addEventListener("click",async()=>{if(await this.confirmationDialog.show("This will permanently delete your game statistics (games played, totals, best score). Your high scores and settings will not be affected. Continue?")){this.storage.clearStatistics();try{this.loadHighScores()}catch{}this.showNotification("Statistics reset")}})}showSection(e){document.querySelectorAll(".nav-item").forEach(t=>{t.classList.remove("active")}),document.querySelector(`[data-section="${e}"]`).classList.add("active"),document.querySelectorAll(".settings-section").forEach(t=>{t.classList.remove("active")}),document.getElementById(`${e}-section`).classList.add("active"),e==="scores"?this.loadHighScores():e==="sounds"&&this.loadSoundCustomization()}loadSoundCustomization(){const e=document.getElementById("sound-customization-container");if(!e)return;this.soundManager.setEnabled(!0);const t=this.soundManager.getSoundEffects(),n=this.soundManager.getAvailablePresets(),c=this.soundManager.customSoundMappings||{};let l="";for(const[a,s]of Object.entries(t)){const o=c[a]||"default",i=o==="none";l+=`
                <div class="sound-effect-item">
                    <div class="sound-effect-info">
                        <h4>${s.name}</h4>
                        <p>${s.description}</p>
                    </div>
                    <select class="sound-preset-select" data-sound="${a}">
                        <option value="default" ${o==="default"?"selected":""}>Default</option>
                        <option value="none" ${o==="none"?"selected":""}>None</option>
                        ${Object.entries(n).map(([r,u])=>r!=="default"?`<option value="${r}" ${o===r?"selected":""}>${u.name}</option>`:"").join("")}
                    </select>
                    <button class="sound-preview-btn" data-sound="${a}">
                        🔊 Preview
                    </button>
                    <button class="sound-mute-btn ${i?"muted":""}" data-sound="${a}" title="${i?"Unmute":"Mute"}">
                        ${i?"🔇":"🔊"}
                    </button>
                </div>
            `}l+=`
            <button class="sound-reset-all-btn" id="reset-all-sounds">
                Reset All to Default
            </button>
        `,e.innerHTML=l,e.querySelectorAll(".sound-preset-select").forEach(a=>{a.addEventListener("change",s=>{const o=s.target.dataset.sound,i=s.target.value;this.soundManager.setCustomSound(o,i);const r=s.target.parentElement.querySelector(".sound-mute-btn");r&&(i==="none"?(r.classList.add("muted"),r.textContent="🔇",r.title="Unmute"):(r.classList.remove("muted"),r.textContent="🔊",r.title="Mute"))})}),e.querySelectorAll(".sound-preview-btn").forEach(a=>{a.addEventListener("click",s=>{const o=s.currentTarget.dataset.sound;if(s.currentTarget.parentElement.querySelector(".sound-preset-select").value==="none"){const u=a.textContent;a.textContent="🔇 Silent",a.style.opacity="0.6",setTimeout(()=>{a.textContent=u,a.style.opacity="1"},500)}else this.soundManager.play(o)})}),e.querySelectorAll(".sound-mute-btn").forEach(a=>{a.addEventListener("click",s=>{const o=s.currentTarget.dataset.sound,i=s.currentTarget.parentElement.querySelector(".sound-preset-select");i.value==="none"?(i.value="default",this.soundManager.setCustomSound(o,"default"),a.classList.remove("muted"),a.textContent="🔊",a.title="Mute"):(i.value="none",this.soundManager.setCustomSound(o,"none"),a.classList.add("muted"),a.textContent="🔇",a.title="Unmute")})});const d=document.getElementById("reset-all-sounds");d&&d.addEventListener("click",async()=>{await this.confirmationDialog.show("Reset all sound effects to their default sounds?")&&this.resetAllSounds()})}resetAllSounds(){this.soundManager.customSoundMappings={},this.soundManager.saveSoundMappings(),this.soundManager.createSounds(),this.loadSoundCustomization(),this.showNotification("All sounds reset to default")}selectTheme(e){this.currentTheme=e,this.applyTheme(e),this.updateThemeUI(),this.updateDifficultyUI(),this.saveSettings()}applyTheme(e){let t=document.getElementById("theme-css");t||(t=document.createElement("link"),t.rel="stylesheet",t.id="theme-css",document.head.appendChild(t)),t.href=`css/themes/${e}.css`;try{Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(d=>(d.getAttribute("href")||"").includes("/assets/wood-")||(d.href||"").includes("/assets/wood-")).forEach(d=>{d.disabled=e!=="wood"})}catch{}const n=document.getElementById("theme-css-light"),c=document.getElementById("theme-css-dark");n&&(n.media="all"),c&&(c.media="all"),document.documentElement.setAttribute("data-theme",e),document.body.className=document.body.className.replace(/light-theme|dark-theme|wood-theme/g,""),document.body.classList.add(`${e}-theme`)}async selectDifficulty(e){var c;const t=localStorage.getItem(((c=this.storage)==null?void 0:c.storageKey)||"blockdoku_game_data");let n=!1;if(t)try{const l=JSON.parse(t);n=l.score>0||l.board.some(d=>d.some(a=>a===1))}catch{n=!1}if(n&&!await this.confirmationDialog.show(`Changing difficulty to ${e.toUpperCase()} will reset your current game and you'll lose your progress. Are you sure you want to continue?`)){this.updateDifficultyUI();return}this.currentDifficulty=e,this.updateDifficultyUI(),this.saveSettings(),window.parent&&window.parent!==window?window.parent.postMessage({type:"difficultyChanged",difficulty:e},"*"):localStorage.setItem("blockdoku_pending_difficulty",e)}updateSetting(e,t){this.settings[e]=t,this.saveSettings()}updateUI(){this.updateThemeUI(),this.updateDifficultyUI(),this.updateGameSettingsUI()}updateThemeUI(){document.querySelectorAll(".theme-option").forEach(e=>{e.classList.remove("selected"),e.dataset.theme===this.currentTheme&&e.classList.add("selected")})}updateDifficultyUI(){document.querySelectorAll(".difficulty-option").forEach(e=>{if(e.classList.remove("selected"),e.dataset.difficulty===this.currentDifficulty)if(e.classList.add("selected"),this.currentTheme==="light"){e.style.color="white",e.style.textShadow="0 1px 2px rgba(0, 0, 0, 0.7)";const t=e.querySelector("h4");t&&(t.style.color="white",t.style.textShadow="0 1px 2px rgba(0, 0, 0, 0.7)");const n=e.querySelector("p");n&&(n.style.color="white",n.style.textShadow="0 1px 2px rgba(0, 0, 0, 0.7)")}else{e.style.color="",e.style.textShadow="";const t=e.querySelector("h4");t&&(t.style.color="",t.style.textShadow="");const n=e.querySelector("p");n&&(n.style.color="",n.style.textShadow="")}})}updateGameSettingsUI(){document.getElementById("enable-hints").checked=this.settings.enableHints||!1,document.getElementById("enable-timer").checked=this.settings.enableTimer||!1,document.getElementById("auto-save").checked=this.settings.autoSave!==!1,document.getElementById("show-points").checked=this.settings.showPoints||!1,this.loadEffectsSettings()}updateBlockPointsDisplay(){const e=this.settings.showPoints||!1;document.querySelectorAll(".block-info").forEach(n=>{e?n.classList.add("show-points"):n.classList.remove("show-points")})}updateBuildInfo(){const e=()=>{if(h.isLoaded()){const t=document.getElementById("version-display"),n=document.getElementById("build-info");t&&(t.textContent=h.getDisplayVersion()),n&&(n.textContent=`Build: ${h.getBuildId()} (${h.getFormattedBuildDate()})`)}else setTimeout(e,100)};e()}loadHighScores(){const e=document.getElementById("high-scores-list"),t=document.getElementById("statistics-display");if(!e||!t){console.error("High scores elements not found");return}const n=this.storage.getHighScores(),c=this.storage.loadStatistics();console.log("Loading statistics:",c),n.length===0?e.innerHTML="<p>No high scores yet. Play a game to set your first record!</p>":e.innerHTML=n.map((l,d)=>`
                <div class="score-item">
                    <div class="rank">#${d+1}</div>
                    <div class="score-value">${l.score}</div>
                    <div class="score-details">${(l.difficulty||"normal").toUpperCase()} • Level ${l.level} • ${new Date(l.date).toLocaleDateString()}</div>
                </div>
            `).join(""),t.innerHTML=`
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${c.gamesPlayed||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${c.totalScore||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${c.bestScore||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Lines:</span>
                <span class="stat-value">${c.totalLinesCleared||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Streak:</span>
                <span class="stat-value">${c.maxCombo||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Combos:</span>
                <span class="stat-value">${c.totalCombos||0}</span>
            </div>
        `}refreshStatistics(){console.log("Refreshing statistics display..."),this.loadHighScores()}saveSettings(){const e={...this.settings,theme:this.currentTheme,difficulty:this.currentDifficulty};this.storage.saveSettings(e)}shareGame(){const e="https://blockdoku.523.life",t="Blockdoku - A Progressive Web App Puzzle Game";navigator.share?navigator.share({title:t,text:"Check out this awesome Blockdoku puzzle game!",url:e}).catch(c=>{console.log("Error sharing:",c),this.fallbackShare(e,t)}):this.fallbackShare(e,t)}fallbackShare(e,t){navigator.clipboard.writeText(e).then(()=>{this.showNotification("Game URL copied to clipboard!")}).catch(()=>{alert(`Share this game: ${e}`)})}shareHighScores(){const e=this.storage.getHighScores(),t=this.storage.loadStatistics();if(e.length===0){this.showNotification("No high scores to share yet!");return}let n=`🏆 Blockdoku High Scores

`;e.slice(0,5).forEach((d,a)=>{const s=(d.difficulty||"normal").toUpperCase(),o=new Date(d.date).toLocaleDateString();n+=`#${a+1} ${d.score.toLocaleString()} (${s}) - Level ${d.level} - ${o}
`}),n+=`
📊 Statistics:
`,n+=`Games Played: ${t.gamesPlayed}
`,n+=`Total Score: ${t.totalScore.toLocaleString()}
`,n+=`Best Score: ${t.bestScore.toLocaleString()}
`,n+=`Max Combo: ${t.maxCombo}
`;const c="https://blockdoku.523.life",l="My Blockdoku High Scores";navigator.share?navigator.share({title:l,text:n,url:c}).catch(d=>{console.log("Error sharing scores:",d),this.fallbackShareScores(n,c,l)}):this.fallbackShareScores(n,c,l)}fallbackShareScores(e,t,n){navigator.clipboard.writeText(`${e}

Play Blockdoku: ${t}`).then(()=>{this.showNotification("High scores copied to clipboard!")}).catch(()=>{alert(`${e}

Play Blockdoku: ${t}`)})}showNotification(e){const t=document.createElement("div");t.style.cssText=`
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
        `,t.textContent=e;const n=document.createElement("style");n.textContent=`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,document.head.appendChild(n),document.body.appendChild(t),setTimeout(()=>{t.remove(),n.remove()},3e3)}}document.addEventListener("DOMContentLoaded",()=>{new y});
