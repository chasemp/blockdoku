class l{constructor(){this.storageKey="blockdoku_game_data",this.settingsKey="blockdoku_settings",this.highScoresKey="blockdoku_high_scores",this.difficultyOverridesKey="blockdoku_difficulty_overrides",this.maxHighScores=10,this.migrateLegacyKeys()}saveGameState(t){try{const e={board:t.board,score:t.score,level:t.level,currentBlocks:t.currentBlocks,selectedBlock:t.selectedBlock,timestamp:Date.now()};return localStorage.setItem(this.storageKey,JSON.stringify(e)),!0}catch(e){return console.error("Failed to save game state:",e),!1}}loadGameState(){try{const t=localStorage.getItem(this.storageKey);if(t){const e=JSON.parse(t),o=24*60*60*1e3;if(Date.now()-e.timestamp<o)return e;this.clearGameState()}return null}catch(t){return console.error("Failed to load game state:",t),null}}clearGameState(){try{return localStorage.removeItem(this.storageKey),!0}catch(t){return console.error("Failed to clear game state:",t),!1}}saveHighScore(t){try{const e=this.getHighScores(),o={score:t.score,level:t.level,linesCleared:t.linesCleared,combo:t.combo,maxCombo:t.maxCombo,difficulty:t.difficulty||"normal",timestamp:Date.now(),date:new Date().toLocaleDateString()};return e.push(o),e.sort((s,i)=>i.score-s.score),e.splice(this.maxHighScores),localStorage.setItem(this.highScoresKey,JSON.stringify(e)),!0}catch(e){return console.error("Failed to save high score:",e),!1}}getHighScores(){try{const t=localStorage.getItem(this.highScoresKey);return t?JSON.parse(t):[]}catch(t){return console.error("Failed to load high scores:",t),[]}}getBestScoresByDifficulty(){const t=this.getHighScores(),e={easy:0,normal:0,hard:0,expert:0};for(const o of t){const s=o.difficulty||"normal";e[s]!==void 0&&o.score>e[s]&&(e[s]=o.score)}return e}isHighScore(t){var o;const e=this.getHighScores();return e.length<this.maxHighScores||t>((o=e[e.length-1])==null?void 0:o.score)}saveSettings(t){try{return localStorage.setItem(this.settingsKey,JSON.stringify(t)),!0}catch(e){return console.error("Failed to save settings:",e),!1}}loadSettings(){try{const t=localStorage.getItem(this.settingsKey);return t?JSON.parse(t):this.getDefaultSettings()}catch(t){return console.error("Failed to load settings:",t),this.getDefaultSettings()}}getDefaultSettings(){const t={theme:"wood",soundEnabled:!1,animationsEnabled:!0,difficulty:"normal",blockHoverEffects:!0,blockSelectionGlow:!0,blockEntranceAnimations:!0,particleEffects:!0,animationSpeed:"normal",autoSave:!0,enableHints:!1,enableTimer:!1,countdownDuration:3,speedTimerDuration:10,enablePetrification:!1,enableDeadPixels:!1,deadPixelsIntensity:0,enableUndo:!1,showPoints:!1,showPlacementPoints:!1,showPersonalBests:!1,comboDisplayMode:"cumulative",speedMode:"bonus",speedDisplayMode:"timer",speedTimerPrecision:"seconds",pieceTimeoutEnabled:!1,enableMagicBlocks:!1,enableWildShapes:!1,autoRotateBlocks:!1};return console.log("Returning default settings with difficulty:",t.difficulty),t}saveStatistics(t){try{const e="blockdoku_statistics",o=this.loadStatistics(),s={gamesPlayed:(o.gamesPlayed||0)+1,totalScore:(o.totalScore||0)+t.score,totalLinesCleared:(o.totalLinesCleared||0)+t.linesCleared,maxCombo:Math.max(o.maxCombo||0,t.maxCombo),totalCombos:(o.totalCombos||0)+(t.totalCombos||0),bestScore:Math.max(o.bestScore||0,t.score),lastPlayed:Date.now()};return localStorage.setItem(e,JSON.stringify(s)),!0}catch(e){return console.error("Failed to save statistics:",e),!1}}loadStatistics(){try{const t=localStorage.getItem("blockdoku_statistics");return t?JSON.parse(t):{gamesPlayed:0,totalScore:0,totalLinesCleared:0,maxCombo:0,totalCombos:0,bestScore:0,lastPlayed:null}}catch(t){return console.error("Failed to load statistics:",t),{gamesPlayed:0,totalScore:0,totalLinesCleared:0,maxCombo:0,totalCombos:0,bestScore:0,lastPlayed:null}}}clearAllData(){try{return localStorage.removeItem(this.storageKey),localStorage.removeItem(this.settingsKey),localStorage.removeItem(this.highScoresKey),localStorage.removeItem("blockdoku_statistics"),!0}catch(t){return console.error("Failed to clear all data:",t),!1}}clearStatistics(){try{return localStorage.removeItem("blockdoku_statistics"),!0}catch(t){return console.error("Failed to clear statistics:",t),!1}}clearHighScores(){try{return localStorage.removeItem(this.highScoresKey),!0}catch(t){return console.error("Failed to clear high scores:",t),!1}}getStorageSize(){try{let t=0;for(let e in localStorage)e.startsWith("blockdoku_")&&(t+=localStorage[e].length);return t}catch(t){return console.error("Failed to calculate storage size:",t),0}}exportData(){try{const t={gameState:this.loadGameState(),settings:this.loadSettings(),highScores:this.getHighScores(),statistics:this.loadStatistics(),exportDate:new Date().toISOString(),version:"1.4.0"};return JSON.stringify(t,null,2)}catch(t){return console.error("Failed to export data:",t),null}}importData(t){try{const e=JSON.parse(t);return e.gameState&&this.saveGameState(e.gameState),e.settings&&this.saveSettings(e.settings),e.highScores&&localStorage.setItem(this.highScoresKey,JSON.stringify(e.highScores)),e.statistics&&localStorage.setItem("blockdoku_statistics",JSON.stringify(e.statistics)),!0}catch(e){return console.error("Failed to import data:",e),!1}}migrateLegacyKeys(){try{const e=localStorage.getItem("blockdoku-settings"),o=localStorage.getItem(this.settingsKey);e&&!o&&localStorage.setItem(this.settingsKey,e);const i=localStorage.getItem("blockdoku_game_state"),n=localStorage.getItem(this.storageKey);i&&!n&&localStorage.setItem(this.storageKey,i)}catch(t){console.warn("GameStorage migration skipped due to error:",t)}}loadDifficultyOverrides(){try{const t=localStorage.getItem(this.difficultyOverridesKey);return t?JSON.parse(t):{}}catch(t){return console.error("Failed to load difficulty overrides:",t),{}}}saveDifficultyOverrides(t){try{return localStorage.setItem(this.difficultyOverridesKey,JSON.stringify(t)),!0}catch(e){return console.error("Failed to save difficulty overrides:",e),!1}}clearDifficultyOverrides(){try{return localStorage.removeItem(this.difficultyOverridesKey),!0}catch(t){return console.error("Failed to clear difficulty overrides:",t),!1}}}class a{constructor(){this.deferredPrompt=null,this.isInstalled=!1,this.installButton=null,this.settingsInstallButton=null,this.init()}init(){this.setupEventListeners(),this.checkInstallStatus(),this.createInstallButton(),this.setupSettingsButton()}setupEventListeners(){window.addEventListener("beforeinstallprompt",t=>{console.log("PWA: beforeinstallprompt event fired"),t.preventDefault(),this.deferredPrompt=t,this.createInstallButton(),this.showInstallButton(),this.updateSettingsButtonStatus()}),window.addEventListener("appinstalled",()=>{console.log("PWA: App was installed"),this.isInstalled=!0,this.hideInstallButton(),this.updateSettingsButtonStatus(),this.deferredPrompt=null}),"serviceWorker"in navigator&&navigator.serviceWorker.addEventListener("controllerchange",()=>{console.log("PWA: Service worker updated"),this.showUpdateNotification()})}checkInstallStatus(){window.matchMedia("(display-mode: standalone)").matches&&(this.isInstalled=!0,console.log("PWA: App is running in standalone mode")),window.navigator.standalone===!0&&(this.isInstalled=!0,console.log("PWA: App is installed on iOS")),this.updateSettingsButtonStatus()}createInstallButton(){if(document.getElementById("install-button")){this.installButton=document.getElementById("install-button");return}this.installButton=document.createElement("button"),this.installButton.id="install-button",this.installButton.className="btn btn-primary install-btn",this.installButton.innerHTML="📱 Install App",this.installButton.style.display="none";let t=document.getElementById("install-button-container");if(!t){const e=document.querySelector(".controls");e&&(t=e)}t&&t.appendChild(this.installButton),this.installButton.addEventListener("click",()=>{this.installApp()})}showInstallButton(){this.installButton&&!this.isInstalled&&(this.installButton.style.display="inline-block",this.installButton.classList.add("show"))}hideInstallButton(){this.installButton&&(this.installButton.style.display="none",this.installButton.classList.remove("show"))}async installApp(){if(!this.deferredPrompt){this.showManualInstallInstructions();return}try{this.deferredPrompt.prompt();const{outcome:t}=await this.deferredPrompt.userChoice;console.log(t==="accepted"?"PWA: User accepted the install prompt":"PWA: User dismissed the install prompt"),this.deferredPrompt=null}catch(t){console.error("PWA: Error during installation",t)}}showManualInstallInstructions(){const t=this.getManualInstallInstructions();alert(t)}getManualInstallInstructions(){const t=navigator.userAgent.toLowerCase();return t.includes("chrome")?`To install this app:
1. Click the three dots menu (⋮) in your browser
2. Select "Install Blockdoku" or "Add to Home screen"`:t.includes("firefox")?`To install this app:
1. Click the three lines menu (☰) in your browser
2. Select "Install" or "Add to Home screen"`:t.includes("safari")?`To install this app:
1. Tap the Share button (□↗) in Safari
2. Select "Add to Home Screen"`:t.includes("edge")?`To install this app:
1. Click the three dots menu (⋯) in your browser
2. Select "Apps" then "Install this site as an app"`:'To install this app, look for an "Install" or "Add to Home Screen" option in your browser menu.'}showUpdateNotification(){const t=document.createElement("div");t.className="update-notification",t.innerHTML=`
            <div class="update-content">
                <span>🔄 App Update Available</span>
                <button class="btn btn-sm" onclick="window.location.reload()">Update Now</button>
            </div>
        `,t.style.cssText=`
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;const e=document.createElement("style");e.textContent=`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,document.head.appendChild(e),document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.remove()},1e4)}isPWASupported(){return"serviceWorker"in navigator&&"PushManager"in window}setupSettingsButton(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{this.initializeSettingsButton()}):this.initializeSettingsButton()}initializeSettingsButton(){this.settingsInstallButton=document.getElementById("pwa-install-button"),this.settingsInstallButton&&(this.settingsInstallButton.addEventListener("click",()=>{this.installApp()}),this.updateSettingsButtonStatus())}updateSettingsButtonStatus(){if(!this.settingsInstallButton)return;const t=document.getElementById("install-status");if(this.isInstalled)this.settingsInstallButton.classList.add("installed"),t&&(t.textContent="Installed as PWA");else if(this.deferredPrompt)this.settingsInstallButton.classList.remove("installed"),t&&(t.textContent="");else if(this.settingsInstallButton.classList.remove("installed"),t){const e=(navigator.userAgent||"").toLowerCase();let o="";e.includes("android")?o="Install via browser menu":/iphone|ipad|ipod/.test(e)?o="Use Share → Add to Home Screen":o="Install via browser menu",t.textContent=o}}getStatus(){return{isInstalled:this.isInstalled,canInstall:!!this.deferredPrompt,isPWASupported:this.isPWASupported(),isOnline:navigator.onLine}}}const c=Object.freeze(Object.defineProperty({__proto__:null,PWAInstallManager:a},Symbol.toStringTag,{value:"Module"}));class d{constructor(){this.container=null,this.resolve=null,this.reject=null,this.initialized=!1}init(){this.initialized||(this.createDialog(),this.setupEventListeners(),this.initialized=!0)}createDialog(){this.container=document.createElement("div"),this.container.className="confirmation-dialog-overlay",this.container.innerHTML=`
            <div class="confirmation-dialog">
                <div class="confirmation-header">
                    <h3 class="confirmation-title">⚠️ Confirm Action</h3>
                </div>
                <div class="confirmation-content">
                    <p class="confirmation-message">This action will reset your current game. Are you sure you want to continue?</p>
                </div>
                <div class="confirmation-actions">
                    <button class="confirmation-btn confirmation-cancel">Cancel</button>
                    <button class="confirmation-btn confirmation-confirm">Confirm</button>
                </div>
            </div>
        `,this.addStyles(),document.body.appendChild(this.container)}addStyles(){const t=document.createElement("style");t.textContent=`
            .confirmation-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                backdrop-filter: blur(5px);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .confirmation-dialog-overlay.show {
                display: flex;
                opacity: 1;
                pointer-events: auto;
            }
            
            .confirmation-dialog {
                background: var(--card-bg, #ffffff);
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 15px;
                padding: 0;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            
            .confirmation-dialog-overlay.show .confirmation-dialog {
                transform: scale(1);
            }
            
            .confirmation-header {
                background: var(--primary-color, #007bff);
                color: white;
                padding: 1.5rem;
                text-align: center;
            }
            
            .confirmation-title {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 600;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .confirmation-content {
                padding: 2rem 1.5rem;
                text-align: center;
            }
            
            .confirmation-message {
                margin: 0;
                font-size: 1rem;
                color: var(--text-color, #333);
                line-height: 1.5;
            }
            
            .confirmation-actions {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                background: var(--header-bg, #f8f9fa);
                border-top: 1px solid var(--border-color, #e0e0e0);
            }
            
            .confirmation-btn {
                flex: 1;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .confirmation-cancel {
                background: var(--secondary-color, #6c757d);
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .confirmation-cancel:hover {
                background: var(--secondary-hover, #545b62);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .confirmation-confirm {
                background: var(--primary-color, #007bff);
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .confirmation-confirm:hover {
                background: var(--primary-hover, #0056b3);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }
            
            @media (max-width: 480px) {
                .confirmation-dialog {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                }
                
                .confirmation-header {
                    padding: 1rem;
                }
                
                .confirmation-title {
                    font-size: 1.1rem;
                }
                
                .confirmation-content {
                    padding: 1.5rem 1rem;
                }
                
                .confirmation-actions {
                    padding: 1rem;
                    flex-direction: column;
                }
                
                .confirmation-btn {
                    padding: 0.875rem 1rem;
                }
            }
        `,document.head.appendChild(t)}setupEventListeners(){this.container.querySelector(".confirmation-cancel").addEventListener("click",()=>{this.hide(!1)}),this.container.querySelector(".confirmation-confirm").addEventListener("click",()=>{this.hide(!0)}),this.container.addEventListener("click",t=>{t.target===this.container&&this.hide(!1)}),document.addEventListener("keydown",t=>{t.key==="Escape"&&this.container.classList.contains("show")&&this.hide(!1)})}show(t="This action will reset your current game. Are you sure you want to continue?"){return this.init(),new Promise((e,o)=>{this.resolve=e,this.reject=o,this.container.querySelector(".confirmation-message").textContent=t,this.container.classList.add("show"),document.body.style.overflow="hidden"})}hide(t){this.container.classList.remove("show"),document.body.style.overflow="",setTimeout(()=>{this.container&&this.container.parentNode&&(this.container.parentNode.removeChild(this.container),this.container=null,this.initialized=!1)},300),this.resolve&&(this.resolve(t),this.resolve=null,this.reject=null)}destroy(){this.container&&this.container.parentNode&&this.container.parentNode.removeChild(this.container)}}export{d as C,l as G,a as P,c as i};
