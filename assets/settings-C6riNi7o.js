import"./wood-B4vXo_re.js";import{G as y,C as S,S as E,P as b}from"./sound-manager-CEn9X5cB.js";import{b as v}from"./build-info-Dwp5dZmk.js";class w{constructor(){this.storage=new y,this.currentTheme="wood",this.currentDifficulty="normal",this.settings=this.storage.loadSettings(),this.pwaInstallManager=null,this.confirmationDialog=new S,this.soundManager=new E,this.init()}init(){this.loadSettings(),this.setupEventListeners(),this.updateUI(),this.updateBuildInfo(),this.initializePWA()}initializePWA(){try{this.pwaInstallManager=new b,console.log("PWA Install Manager initialized in settings")}catch(e){console.error("Failed to initialize PWA Install Manager:",e)}}loadSettings(){this.currentTheme=this.settings.theme||"wood",this.currentDifficulty=this.settings.difficulty||"normal",this.applyTheme(this.currentTheme),this.loadEffectsSettings(),this.updateDifficultyUI()}loadEffectsSettings(){const e=document.getElementById("sound-enabled");e&&(e.checked=this.settings.soundEnabled===!0);const s=document.getElementById("sound-enabled-sounds-section");s&&(s.checked=this.settings.soundEnabled===!0);const n=document.getElementById("animations-enabled");n&&(n.checked=this.settings.animationsEnabled!==!1);const a=document.getElementById("particles-enabled");a&&(a.checked=this.settings.particlesEnabled!==!1);const i=document.getElementById("haptic-enabled");i&&(i.checked=this.settings.hapticEnabled!==!1);const d=document.getElementById("enable-hints");d&&(d.checked=this.settings.enableHints===!0);const m=document.getElementById("enable-timer");m&&(m.checked=this.settings.enableTimer===!0);const o=document.getElementById("auto-save");o&&(o.checked=this.settings.autoSave!==!1);const r=document.getElementById("show-points");r&&(r.checked=this.settings.showPoints===!0);const t=document.getElementById("show-high-score");t&&(t.checked=this.settings.showHighScore===!0);const l=document.getElementById("enable-speed-bonus");l&&(l.checked=this.settings.enableSpeedBonus!==!1);const h=document.getElementById("show-speed-bonus");h&&(h.checked=this.settings.showSpeedBonus===!0);const c=document.getElementById("combo-streak"),g=document.getElementById("combo-cumulative");c&&g&&((this.settings.comboDisplayMode||"cumulative")==="cumulative"?g.checked=!0:c.checked=!0)}setupEventListeners(){document.querySelectorAll(".nav-item").forEach(t=>{let l=null,h=null,c=!1;const g=u=>{u.preventDefault(),this.showSection(t.dataset.section)},p=u=>{u.preventDefault(),!c&&(c=!0,l=Date.now(),t.classList.add("pressing"),h=setTimeout(()=>{c&&(g(u),this.resetPressState(t,h,c))},1500))},f=u=>{c&&(u.preventDefault(),this.resetPressState(t,h,c))};t.addEventListener("mousedown",p),t.addEventListener("mouseup",f),t.addEventListener("mouseleave",f),t.addEventListener("touchstart",p,{passive:!1}),t.addEventListener("touchend",f,{passive:!1}),t.addEventListener("touchcancel",f,{passive:!1}),t.addEventListener("click",u=>{u.preventDefault(),!c&&(!l||Date.now()-l<200)&&g(u)})}),document.querySelectorAll(".theme-option").forEach(t=>{let l=null,h=null,c=!1;const g=u=>{this.selectTheme(u.currentTarget.dataset.theme)},p=u=>{u.preventDefault(),!c&&(c=!0,l=Date.now(),t.classList.add("pressing"),h=setTimeout(()=>{c&&(g(u),this.resetPressState(t,h,c))},1500))},f=u=>{c&&(u.preventDefault(),this.resetPressState(t,h,c))};t.addEventListener("mousedown",p),t.addEventListener("mouseup",f),t.addEventListener("mouseleave",f),t.addEventListener("touchstart",p,{passive:!1}),t.addEventListener("touchend",f,{passive:!1}),t.addEventListener("touchcancel",f,{passive:!1}),t.addEventListener("click",u=>{u.preventDefault(),!c&&(!l||Date.now()-l<200)&&g(u)})}),document.querySelectorAll(".difficulty-option").forEach(t=>{let l=null,h=null,c=!1;const g=async u=>{await this.selectDifficulty(u.currentTarget.dataset.difficulty)},p=u=>{u.preventDefault(),!c&&(c=!0,l=Date.now(),t.classList.add("pressing"),h=setTimeout(async()=>{c&&(await g(u),this.resetPressState(t,h,c))},1500))},f=u=>{c&&(u.preventDefault(),this.resetPressState(t,h,c))};t.addEventListener("mousedown",p),t.addEventListener("mouseup",f),t.addEventListener("mouseleave",f),t.addEventListener("touchstart",p,{passive:!1}),t.addEventListener("touchend",f,{passive:!1}),t.addEventListener("touchcancel",f,{passive:!1}),t.addEventListener("click",async u=>{u.preventDefault(),!c&&(!l||Date.now()-l<200)&&await g(u)})}),document.getElementById("enable-hints").addEventListener("change",t=>{this.updateSetting("enableHints",t.target.checked)}),document.getElementById("enable-timer").addEventListener("change",t=>{this.updateSetting("enableTimer",t.target.checked)}),document.getElementById("sound-enabled").addEventListener("change",t=>{this.updateSetting("soundEnabled",t.target.checked);const l=document.getElementById("sound-enabled-sounds-section");l&&(l.checked=t.target.checked)});const e=document.getElementById("sound-enabled-sounds-section");e&&e.addEventListener("change",t=>{this.updateSetting("soundEnabled",t.target.checked);const l=document.getElementById("sound-enabled");l&&(l.checked=t.target.checked)}),document.getElementById("animations-enabled").addEventListener("change",t=>{this.updateSetting("animationsEnabled",t.target.checked)}),document.getElementById("auto-save").addEventListener("change",t=>{this.updateSetting("autoSave",t.target.checked)}),document.getElementById("show-points").addEventListener("change",t=>{this.updateSetting("showPoints",t.target.checked),this.updateBlockPointsDisplay()});const s=document.getElementById("show-high-score");s&&s.addEventListener("change",t=>{this.updateSetting("showHighScore",t.target.checked)});const n=document.getElementById("enable-speed-bonus");n&&n.addEventListener("change",t=>{this.updateSetting("enableSpeedBonus",t.target.checked)});const a=document.getElementById("show-speed-bonus");a&&a.addEventListener("change",t=>{this.updateSetting("showSpeedBonus",t.target.checked)});const i=document.getElementById("combo-streak"),d=document.getElementById("combo-cumulative");i&&d&&(i.addEventListener("change",t=>{t.target.checked&&this.updateSetting("comboDisplayMode","streak")}),d.addEventListener("change",t=>{t.target.checked&&this.updateSetting("comboDisplayMode","cumulative")})),document.getElementById("particles-enabled").addEventListener("change",t=>{this.updateSetting("particlesEnabled",t.target.checked)}),document.getElementById("haptic-enabled").addEventListener("change",t=>{this.updateSetting("hapticEnabled",t.target.checked)});const m=document.getElementById("share-button");m&&m.addEventListener("click",()=>{this.shareGame()});const o=document.getElementById("share-scores-button");o&&o.addEventListener("click",()=>{this.shareHighScores()});const r=document.getElementById("reset-stats");r&&r.addEventListener("click",async()=>{if(await this.confirmationDialog.show("This will permanently delete your game statistics (games played, totals, best score). Your high scores and settings will not be affected. Continue?")){this.storage.clearStatistics();try{this.loadHighScores()}catch{}this.showNotification("Statistics reset")}})}resetPressState(e,s,n){s&&clearTimeout(s),e.classList.remove("pressing")}showSection(e){document.querySelectorAll(".nav-item").forEach(s=>{s.classList.remove("active")}),document.querySelector(`[data-section="${e}"]`).classList.add("active"),document.querySelectorAll(".settings-section").forEach(s=>{s.classList.remove("active")}),document.getElementById(`${e}-section`).classList.add("active"),e==="scores"?this.loadHighScores():e==="sounds"&&this.loadSoundCustomization()}loadSoundCustomization(){const e=document.getElementById("sound-customization-container");if(!e)return;this.soundManager.setEnabled(!0);const s=this.soundManager.getGroupedSoundEffects(),n=this.soundManager.getAvailablePresets(),a=this.soundManager.getGroupedSoundSettings();let i="";for(const[o,r]of Object.entries(s)){const t=a[o]||"default",l=t==="mixed",h=t==="none";i+=`
                <div class="sound-group-item">
                    <div class="sound-group-info">
                        <h4>${r.name}</h4>
                        <p>${r.description}</p>
                        <div class="sound-group-details">
                            <small>Includes: ${r.sounds.length} sound${r.sounds.length!==1?"s":""}</small>
                            ${l?'<small class="mixed-indicator">⚠️ Mixed presets</small>':""}
                        </div>
                    </div>
                    <div class="sound-group-controls">
                        <select class="sound-group-preset-select" data-group="${o}">
                            <option value="default" ${t==="default"?"selected":""}>Default</option>
                            <option value="none" ${t==="none"?"selected":""}>None</option>
                            ${Object.entries(n).map(([c,g])=>c!=="default"?`<option value="${c}" ${t===c?"selected":""}>${g.name}</option>`:"").join("")}
                        </select>
                        <button class="sound-group-preview-btn" data-group="${o}">
                            🔊 Preview
                        </button>
                        <button class="sound-group-mute-btn ${h?"muted":""}" data-group="${o}" title="${h?"Unmute":"Mute"}">
                            ${h?"🔇":"🔊"}
                        </button>
                    </div>
                </div>
            `}i+=`
            <div class="sound-group-actions">
                <button class="sound-reset-all-btn" id="reset-all-sounds">
                    Reset All to Default
                </button>
                <button class="sound-advanced-btn" id="show-advanced-sounds">
                    Advanced Individual Settings
                </button>
            </div>
        `,e.innerHTML=i,e.querySelectorAll(".sound-group-preset-select").forEach(o=>{o.addEventListener("change",r=>{const t=r.target.dataset.group,l=r.target.value;this.soundManager.setGroupedSoundSettings(t,l);const h=r.target.parentElement.querySelector(".sound-group-mute-btn");h&&(l==="none"?(h.classList.add("muted"),h.textContent="🔇",h.title="Unmute"):(h.classList.remove("muted"),h.textContent="🔊",h.title="Mute"));const c=r.target.closest(".sound-group-item"),g=c.querySelector(".mixed-indicator");if(l==="mixed"){if(!g){const p=c.querySelector(".sound-group-details");p.innerHTML+='<small class="mixed-indicator">⚠️ Mixed presets</small>'}}else g&&g.remove()})}),e.querySelectorAll(".sound-group-preview-btn").forEach(o=>{o.addEventListener("click",r=>{const t=r.currentTarget.dataset.group;if(r.currentTarget.parentElement.querySelector(".sound-group-preset-select").value==="none"){const c=o.textContent;o.textContent="🔇 Silent",o.style.opacity="0.6",setTimeout(()=>{o.textContent=c,o.style.opacity="1"},500)}else this.soundManager.previewGroupedSound(t)})}),e.querySelectorAll(".sound-group-mute-btn").forEach(o=>{o.addEventListener("click",r=>{const t=r.currentTarget.dataset.group,l=r.currentTarget.parentElement.querySelector(".sound-group-preset-select");l.value==="none"?(l.value="default",this.soundManager.setGroupedSoundSettings(t,"default"),o.classList.remove("muted"),o.textContent="🔊",o.title="Mute"):(l.value="none",this.soundManager.setGroupedSoundSettings(t,"none"),o.classList.add("muted"),o.textContent="🔇",o.title="Unmute")})});const d=document.getElementById("reset-all-sounds");d&&d.addEventListener("click",async()=>{await this.confirmationDialog.show("Reset all sound effects to their default sounds?")&&this.resetAllSounds()});const m=document.getElementById("show-advanced-sounds");m&&m.addEventListener("click",()=>{this.toggleAdvancedSoundSettings()})}resetAllSounds(){this.soundManager.customSoundMappings={},this.soundManager.saveSoundMappings(),this.soundManager.createSounds(),this.loadSoundCustomization(),this.showNotification("All sounds reset to default")}toggleAdvancedSoundSettings(){const e=document.getElementById("sound-customization-container");if(!e)return;e.querySelector(".sound-effect-item")?this.loadSoundCustomization():this.loadAdvancedSoundCustomization()}loadAdvancedSoundCustomization(){const e=document.getElementById("sound-customization-container");if(!e)return;this.soundManager.setEnabled(!0);const s=this.soundManager.getSoundEffects(),n=this.soundManager.getAvailablePresets(),a=this.soundManager.customSoundMappings||{};let i="";for(const[d,m]of Object.entries(s)){const o=a[d]||"default",r=o==="none";i+=`
                <div class="sound-effect-item">
                    <div class="sound-effect-info">
                        <h4>${m.name}</h4>
                        <p>${m.description}</p>
                    </div>
                    <select class="sound-preset-select" data-sound="${d}">
                        <option value="default" ${o==="default"?"selected":""}>Default</option>
                        <option value="none" ${o==="none"?"selected":""}>None</option>
                        ${Object.entries(n).map(([t,l])=>t!=="default"?`<option value="${t}" ${o===t?"selected":""}>${l.name}</option>`:"").join("")}
                    </select>
                    <button class="sound-preview-btn" data-sound="${d}">
                        🔊 Preview
                    </button>
                    <button class="sound-mute-btn ${r?"muted":""}" data-sound="${d}" title="${r?"Unmute":"Mute"}">
                        ${r?"🔇":"🔊"}
                    </button>
                </div>
            `}i+=`
            <div class="sound-group-actions">
                <button class="sound-reset-all-btn" id="reset-all-sounds">
                    Reset All to Default
                </button>
                <button class="sound-advanced-btn" id="show-advanced-sounds">
                    Back to Grouped Settings
                </button>
            </div>
        `,e.innerHTML=i,this.setupIndividualSoundEventListeners(e)}setupIndividualSoundEventListeners(e){e.querySelectorAll(".sound-preset-select").forEach(a=>{a.addEventListener("change",i=>{const d=i.target.dataset.sound,m=i.target.value;this.soundManager.setCustomSound(d,m);const o=i.target.parentElement.querySelector(".sound-mute-btn");o&&(m==="none"?(o.classList.add("muted"),o.textContent="🔇",o.title="Unmute"):(o.classList.remove("muted"),o.textContent="🔊",o.title="Mute"))})}),e.querySelectorAll(".sound-preview-btn").forEach(a=>{a.addEventListener("click",i=>{const d=i.currentTarget.dataset.sound;if(i.currentTarget.parentElement.querySelector(".sound-preset-select").value==="none"){const r=a.textContent;a.textContent="🔇 Silent",a.style.opacity="0.6",setTimeout(()=>{a.textContent=r,a.style.opacity="1"},500)}else this.soundManager.play(d)})}),e.querySelectorAll(".sound-mute-btn").forEach(a=>{a.addEventListener("click",i=>{const d=i.currentTarget.dataset.sound,m=i.currentTarget.parentElement.querySelector(".sound-preset-select");m.value==="none"?(m.value="default",this.soundManager.setCustomSound(d,"default"),a.classList.remove("muted"),a.textContent="🔊",a.title="Mute"):(m.value="none",this.soundManager.setCustomSound(d,"none"),a.classList.add("muted"),a.textContent="🔇",a.title="Unmute")})});const s=document.getElementById("reset-all-sounds");s&&s.addEventListener("click",async()=>{await this.confirmationDialog.show("Reset all sound effects to their default sounds?")&&this.resetAllSounds()});const n=document.getElementById("show-advanced-sounds");n&&n.addEventListener("click",()=>{this.toggleAdvancedSoundSettings()})}selectTheme(e){this.currentTheme=e,this.applyTheme(e),this.updateThemeUI(),this.updateDifficultyUI(),this.saveSettings()}applyTheme(e){let s=document.getElementById("theme-css");s||(s=document.createElement("link"),s.rel="stylesheet",s.id="theme-css",document.head.appendChild(s)),s.href=`css/themes/${e}.css`;try{Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(d=>(d.getAttribute("href")||"").includes("/assets/wood-")||(d.href||"").includes("/assets/wood-")).forEach(d=>{d.disabled=e!=="wood"})}catch{}const n=document.getElementById("theme-css-light"),a=document.getElementById("theme-css-dark");n&&(n.media="all"),a&&(a.media="all"),document.documentElement.setAttribute("data-theme",e),document.body.className=document.body.className.replace(/light-theme|dark-theme|wood-theme/g,""),document.body.classList.add(`${e}-theme`)}async selectDifficulty(e){var a;const s=localStorage.getItem(((a=this.storage)==null?void 0:a.storageKey)||"blockdoku_game_data");let n=!1;if(s)try{const i=JSON.parse(s);n=i.score>0||i.board.some(d=>d.some(m=>m===1))}catch{n=!1}if(n&&!await this.confirmationDialog.show(`Changing difficulty to ${e.toUpperCase()} will reset your current game and you'll lose your progress. Are you sure you want to continue?`)){this.updateDifficultyUI();return}this.currentDifficulty=e,this.updateDifficultyUI(),this.saveSettings(),window.parent&&window.parent!==window?window.parent.postMessage({type:"difficultyChanged",difficulty:e},"*"):localStorage.setItem("blockdoku_pending_difficulty",e)}updateSetting(e,s){this.settings[e]=s,this.saveSettings()}updateUI(){this.updateThemeUI(),this.updateDifficultyUI(),this.updateGameSettingsUI()}updateThemeUI(){document.querySelectorAll(".theme-option").forEach(e=>{e.classList.remove("selected"),e.dataset.theme===this.currentTheme&&e.classList.add("selected")})}updateDifficultyUI(){document.querySelectorAll(".difficulty-option").forEach(e=>{if(e.classList.remove("selected"),e.dataset.difficulty===this.currentDifficulty)if(e.classList.add("selected"),this.currentTheme==="light"){e.style.color="white",e.style.textShadow="0 1px 2px rgba(0, 0, 0, 0.7)";const s=e.querySelector("h4");s&&(s.style.color="white",s.style.textShadow="0 1px 2px rgba(0, 0, 0, 0.7)");const n=e.querySelector("p");n&&(n.style.color="white",n.style.textShadow="0 1px 2px rgba(0, 0, 0, 0.7)")}else{e.style.color="",e.style.textShadow="";const s=e.querySelector("h4");s&&(s.style.color="",s.style.textShadow="");const n=e.querySelector("p");n&&(n.style.color="",n.style.textShadow="")}})}updateGameSettingsUI(){document.getElementById("enable-hints").checked=this.settings.enableHints||!1,document.getElementById("enable-timer").checked=this.settings.enableTimer||!1,document.getElementById("auto-save").checked=this.settings.autoSave!==!1,document.getElementById("show-points").checked=this.settings.showPoints||!1,this.loadEffectsSettings()}updateBlockPointsDisplay(){const e=this.settings.showPoints||!1;document.querySelectorAll(".block-info").forEach(n=>{e?n.classList.add("show-points"):n.classList.remove("show-points")})}updateBuildInfo(){const e=()=>{if(v.isLoaded()){const s=document.getElementById("version-display"),n=document.getElementById("build-info");s&&(s.textContent=v.getDisplayVersion()),n&&(n.textContent=`Build: ${v.getBuildId()} (${v.getFormattedBuildDate()})`)}else setTimeout(e,100)};e()}loadHighScores(){const e=document.getElementById("high-scores-list"),s=document.getElementById("statistics-display");if(!e||!s){console.error("High scores elements not found");return}const n=this.storage.getHighScores(),a=this.storage.loadStatistics();console.log("Loading statistics:",a),n.length===0?e.innerHTML="<p>No high scores yet. Play a game to set your first record!</p>":e.innerHTML=n.map((i,d)=>`
                <div class="score-item">
                    <div class="rank">#${d+1}</div>
                    <div class="score-value">${i.score}</div>
                    <div class="score-details">${(i.difficulty||"normal").toUpperCase()} • Level ${i.level} • ${new Date(i.date).toLocaleDateString()}</div>
                </div>
            `).join(""),s.innerHTML=`
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${a.gamesPlayed||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${a.totalScore||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${a.bestScore||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Lines:</span>
                <span class="stat-value">${a.totalLinesCleared||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Streak:</span>
                <span class="stat-value">${a.maxCombo||0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Combos:</span>
                <span class="stat-value">${a.totalCombos||0}</span>
            </div>
        `}refreshStatistics(){console.log("Refreshing statistics display..."),this.loadHighScores()}saveSettings(){const e={...this.settings,theme:this.currentTheme,difficulty:this.currentDifficulty};this.storage.saveSettings(e)}shareGame(){const e="https://blockdoku.523.life",s="Blockdoku - A Progressive Web App Puzzle Game";navigator.share?navigator.share({title:s,text:"Check out this awesome Blockdoku puzzle game!",url:e}).catch(a=>{console.log("Error sharing:",a),this.fallbackShare(e,s)}):this.fallbackShare(e,s)}fallbackShare(e,s){navigator.clipboard.writeText(e).then(()=>{this.showNotification("Game URL copied to clipboard!")}).catch(()=>{alert(`Share this game: ${e}`)})}shareHighScores(){const e=this.storage.getHighScores(),s=this.storage.loadStatistics();if(e.length===0){this.showNotification("No high scores to share yet!");return}let n=`🏆 Blockdoku High Scores

`;e.slice(0,5).forEach((d,m)=>{const o=(d.difficulty||"normal").toUpperCase(),r=new Date(d.date).toLocaleDateString();n+=`#${m+1} ${d.score.toLocaleString()} (${o}) - Level ${d.level} - ${r}
`}),n+=`
📊 Statistics:
`,n+=`Games Played: ${s.gamesPlayed}
`,n+=`Total Score: ${s.totalScore.toLocaleString()}
`,n+=`Best Score: ${s.bestScore.toLocaleString()}
`,n+=`Max Combo: ${s.maxCombo}
`;const a="https://blockdoku.523.life",i="My Blockdoku High Scores";navigator.share?navigator.share({title:i,text:n,url:a}).catch(d=>{console.log("Error sharing scores:",d),this.fallbackShareScores(n,a,i)}):this.fallbackShareScores(n,a,i)}fallbackShareScores(e,s,n){navigator.clipboard.writeText(`${e}

Play Blockdoku: ${s}`).then(()=>{this.showNotification("High scores copied to clipboard!")}).catch(()=>{alert(`${e}

Play Blockdoku: ${s}`)})}showNotification(e){const s=document.createElement("div");s.style.cssText=`
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
        `,s.textContent=e;const n=document.createElement("style");n.textContent=`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,document.head.appendChild(n),document.body.appendChild(s),setTimeout(()=>{s.remove(),n.remove()},3e3)}}document.addEventListener("DOMContentLoaded",()=>{new w});
