class l{constructor(){this.storageKey="blockdoku_game_data",this.settingsKey="blockdoku_settings",this.highScoresKey="blockdoku_high_scores",this.maxHighScores=10,this.migrateLegacyKeys()}saveGameState(t){try{const o={board:t.board,score:t.score,level:t.level,currentBlocks:t.currentBlocks,selectedBlock:t.selectedBlock,timestamp:Date.now()};return localStorage.setItem(this.storageKey,JSON.stringify(o)),!0}catch(o){return console.error("Failed to save game state:",o),!1}}loadGameState(){try{const t=localStorage.getItem(this.storageKey);if(t){const o=JSON.parse(t),e=24*60*60*1e3;if(Date.now()-o.timestamp<e)return o;this.clearGameState()}return null}catch(t){return console.error("Failed to load game state:",t),null}}clearGameState(){try{return localStorage.removeItem(this.storageKey),!0}catch(t){return console.error("Failed to clear game state:",t),!1}}saveHighScore(t){try{const o=this.getHighScores(),e={score:t.score,level:t.level,linesCleared:t.linesCleared,combo:t.combo,maxCombo:t.maxCombo,difficulty:t.difficulty||"normal",timestamp:Date.now(),date:new Date().toLocaleDateString()};return o.push(e),o.sort((a,n)=>n.score-a.score),o.splice(this.maxHighScores),localStorage.setItem(this.highScoresKey,JSON.stringify(o)),!0}catch(o){return console.error("Failed to save high score:",o),!1}}getHighScores(){try{const t=localStorage.getItem(this.highScoresKey);return t?JSON.parse(t):[]}catch(t){return console.error("Failed to load high scores:",t),[]}}getBestScoresByDifficulty(){const t=this.getHighScores(),o={easy:0,normal:0,hard:0,expert:0};for(const e of t){const a=e.difficulty||"normal";o[a]!==void 0&&e.score>o[a]&&(o[a]=e.score)}return o}isHighScore(t){var e;const o=this.getHighScores();return o.length<this.maxHighScores||t>((e=o[o.length-1])==null?void 0:e.score)}saveSettings(t){try{return localStorage.setItem(this.settingsKey,JSON.stringify(t)),!0}catch(o){return console.error("Failed to save settings:",o),!1}}loadSettings(){try{const t=localStorage.getItem(this.settingsKey);return t?JSON.parse(t):this.getDefaultSettings()}catch(t){return console.error("Failed to load settings:",t),this.getDefaultSettings()}}getDefaultSettings(){return{theme:"wood",soundEnabled:!1,animationsEnabled:!0,difficulty:"normal",autoSave:!0,enableHints:!1,enableTimer:!1,enableUndo:!1,showPoints:!1,showHighScore:!1,comboDisplayMode:"streak"}}saveStatistics(t){try{const o="blockdoku_statistics",e=this.loadStatistics(),a={gamesPlayed:(e.gamesPlayed||0)+1,totalScore:(e.totalScore||0)+t.score,totalLinesCleared:(e.totalLinesCleared||0)+t.linesCleared,maxCombo:Math.max(e.maxCombo||0,t.maxCombo),bestScore:Math.max(e.bestScore||0,t.score),lastPlayed:Date.now()};return localStorage.setItem(o,JSON.stringify(a)),!0}catch(o){return console.error("Failed to save statistics:",o),!1}}loadStatistics(){try{const t=localStorage.getItem("blockdoku_statistics");return t?JSON.parse(t):{gamesPlayed:0,totalScore:0,totalLinesCleared:0,maxCombo:0,bestScore:0,lastPlayed:null}}catch(t){return console.error("Failed to load statistics:",t),{gamesPlayed:0,totalScore:0,totalLinesCleared:0,maxCombo:0,bestScore:0,lastPlayed:null}}}clearAllData(){try{return localStorage.removeItem(this.storageKey),localStorage.removeItem(this.settingsKey),localStorage.removeItem(this.highScoresKey),localStorage.removeItem("blockdoku_statistics"),!0}catch(t){return console.error("Failed to clear all data:",t),!1}}clearStatistics(){try{return localStorage.removeItem("blockdoku_statistics"),!0}catch(t){return console.error("Failed to clear statistics:",t),!1}}getStorageSize(){try{let t=0;for(let o in localStorage)o.startsWith("blockdoku_")&&(t+=localStorage[o].length);return t}catch(t){return console.error("Failed to calculate storage size:",t),0}}exportData(){try{const t={gameState:this.loadGameState(),settings:this.loadSettings(),highScores:this.getHighScores(),statistics:this.loadStatistics(),exportDate:new Date().toISOString(),version:"1.4.0"};return JSON.stringify(t,null,2)}catch(t){return console.error("Failed to export data:",t),null}}importData(t){try{const o=JSON.parse(t);return o.gameState&&this.saveGameState(o.gameState),o.settings&&this.saveSettings(o.settings),o.highScores&&localStorage.setItem(this.highScoresKey,JSON.stringify(o.highScores)),o.statistics&&localStorage.setItem("blockdoku_statistics",JSON.stringify(o.statistics)),!0}catch(o){return console.error("Failed to import data:",o),!1}}migrateLegacyKeys(){try{const o=localStorage.getItem("blockdoku-settings"),e=localStorage.getItem(this.settingsKey);o&&!e&&localStorage.setItem(this.settingsKey,o);const n=localStorage.getItem("blockdoku_game_state"),i=localStorage.getItem(this.storageKey);n&&!i&&localStorage.setItem(this.storageKey,n)}catch(t){console.warn("GameStorage migration skipped due to error:",t)}}}class r{constructor(){this.deferredPrompt=null,this.isInstalled=!1,this.installButton=null,this.settingsInstallButton=null,this.init()}init(){this.setupEventListeners(),this.checkInstallStatus(),this.createInstallButton(),this.setupSettingsButton()}setupEventListeners(){window.addEventListener("beforeinstallprompt",t=>{console.log("PWA: beforeinstallprompt event fired"),t.preventDefault(),this.deferredPrompt=t,this.createInstallButton(),this.showInstallButton(),this.updateSettingsButtonStatus()}),window.addEventListener("appinstalled",()=>{console.log("PWA: App was installed"),this.isInstalled=!0,this.hideInstallButton(),this.updateSettingsButtonStatus(),this.deferredPrompt=null}),"serviceWorker"in navigator&&navigator.serviceWorker.addEventListener("controllerchange",()=>{console.log("PWA: Service worker updated"),this.showUpdateNotification()})}checkInstallStatus(){window.matchMedia("(display-mode: standalone)").matches&&(this.isInstalled=!0,console.log("PWA: App is running in standalone mode")),window.navigator.standalone===!0&&(this.isInstalled=!0,console.log("PWA: App is installed on iOS")),this.updateSettingsButtonStatus()}createInstallButton(){if(document.getElementById("install-button")){this.installButton=document.getElementById("install-button");return}this.installButton=document.createElement("button"),this.installButton.id="install-button",this.installButton.className="btn btn-primary install-btn",this.installButton.innerHTML="📱 Install App",this.installButton.style.display="none";let t=document.getElementById("install-button-container");if(!t){const o=document.querySelector(".controls");o&&(t=o)}t&&t.appendChild(this.installButton),this.installButton.addEventListener("click",()=>{this.installApp()})}showInstallButton(){this.installButton&&!this.isInstalled&&(this.installButton.style.display="inline-block",this.installButton.classList.add("show"))}hideInstallButton(){this.installButton&&(this.installButton.style.display="none",this.installButton.classList.remove("show"))}async installApp(){if(!this.deferredPrompt){this.showManualInstallInstructions();return}try{this.deferredPrompt.prompt();const{outcome:t}=await this.deferredPrompt.userChoice;console.log(t==="accepted"?"PWA: User accepted the install prompt":"PWA: User dismissed the install prompt"),this.deferredPrompt=null}catch(t){console.error("PWA: Error during installation",t)}}showManualInstallInstructions(){const t=this.getManualInstallInstructions();alert(t)}getManualInstallInstructions(){const t=navigator.userAgent.toLowerCase();return t.includes("chrome")?`To install this app:
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
        `;const o=document.createElement("style");o.textContent=`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,document.head.appendChild(o),document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.remove()},1e4)}isPWASupported(){return"serviceWorker"in navigator&&"PushManager"in window}setupSettingsButton(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{this.initializeSettingsButton()}):this.initializeSettingsButton()}initializeSettingsButton(){this.settingsInstallButton=document.getElementById("pwa-install-button"),this.settingsInstallButton&&(this.settingsInstallButton.addEventListener("click",()=>{this.installApp()}),this.updateSettingsButtonStatus())}updateSettingsButtonStatus(){if(!this.settingsInstallButton)return;const t=document.getElementById("install-status");if(this.isInstalled)this.settingsInstallButton.classList.add("installed"),t&&(t.textContent="Installed as PWA");else if(this.deferredPrompt)this.settingsInstallButton.classList.remove("installed"),t&&(t.textContent="");else if(this.settingsInstallButton.classList.remove("installed"),t){const o=(navigator.userAgent||"").toLowerCase();let e="";o.includes("android")?e="Install via browser menu":/iphone|ipad|ipod/.test(o)?e="Use Share → Add to Home Screen":e="Install via browser menu",t.textContent=e}}getStatus(){return{isInstalled:this.isInstalled,canInstall:!!this.deferredPrompt,isPWASupported:this.isPWASupported(),isOnline:navigator.onLine}}}const c=Object.freeze(Object.defineProperty({__proto__:null,PWAInstallManager:r},Symbol.toStringTag,{value:"Module"}));class d{constructor(){this.container=null,this.resolve=null,this.reject=null,this.initialized=!1}init(){this.initialized||(this.createDialog(),this.setupEventListeners(),this.initialized=!0)}createDialog(){this.container=document.createElement("div"),this.container.className="confirmation-dialog-overlay",this.container.innerHTML=`
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
        `,document.head.appendChild(t)}setupEventListeners(){this.container.querySelector(".confirmation-cancel").addEventListener("click",()=>{this.hide(!1)}),this.container.querySelector(".confirmation-confirm").addEventListener("click",()=>{this.hide(!0)}),this.container.addEventListener("click",t=>{t.target===this.container&&this.hide(!1)}),document.addEventListener("keydown",t=>{t.key==="Escape"&&this.container.classList.contains("show")&&this.hide(!1)})}show(t="This action will reset your current game. Are you sure you want to continue?"){return this.init(),new Promise((o,e)=>{this.resolve=o,this.reject=e,this.container.querySelector(".confirmation-message").textContent=t,this.container.classList.add("show"),document.body.style.overflow="hidden"})}hide(t){this.container.classList.remove("show"),document.body.style.overflow="",this.resolve&&(this.resolve(t),this.resolve=null,this.reject=null)}destroy(){this.container&&this.container.parentNode&&this.container.parentNode.removeChild(this.container)}}class u{constructor(){this.audioContext=null,this.isEnabled=!1,this.volume=.5,this.sounds={},this.soundPresets={},this.customSoundMappings={},this.init()}init(){try{this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.createSoundPresets(),this.loadCustomSoundMappings(),this.createSounds()}catch(t){console.warn("Web Audio API not supported:",t),this.isEnabled=!1}}loadCustomSoundMappings(){try{const t=localStorage.getItem("blockdoku_sound_mappings");t&&(this.customSoundMappings=JSON.parse(t))}catch(t){console.warn("Failed to load sound mappings:",t)}}saveSoundMappings(){try{localStorage.setItem("blockdoku_sound_mappings",JSON.stringify(this.customSoundMappings))}catch(t){console.warn("Failed to save sound mappings:",t)}}setCustomSound(t,o){o==="default"||o===null?delete this.customSoundMappings[t]:this.customSoundMappings[t]=o,this.saveSoundMappings(),this.createSounds()}getAvailablePresets(){return{default:{name:"Default",description:"Standard game sound"},chime:{name:"Chime",description:"Gentle bell-like tone"},beep:{name:"Beep",description:"Electronic beep"},pop:{name:"Pop",description:"Quick pop sound"},swoosh:{name:"Swoosh",description:"Whoosh effect"},ding:{name:"Ding",description:"High-pitched ding"},thud:{name:"Thud",description:"Low bass thump"},click:{name:"Click",description:"Sharp click sound"}}}createSoundPresets(){this.audioContext&&(this.soundPresets={chime:this.createChimePreset(),beep:this.createBeepPreset(),pop:this.createPopPreset(),swoosh:this.createSwooshPreset(),ding:this.createDingPreset(),thud:this.createThudPreset(),click:this.createClickPreset()})}setEnabled(t){this.isEnabled=t}setVolume(t){this.volume=Math.max(0,Math.min(1,t))}createSounds(){if(!this.audioContext)return;const t=(o,e)=>{const a=this.customSoundMappings[o];return a==="none"?null:a&&this.soundPresets[a]?this.soundPresets[a]:e.call(this)};this.sounds={blockPlace:t("blockPlace",this.createBlockPlaceSound),lineClear:t("lineClear",this.createLineClearSound),levelUp:t("levelUp",this.createLevelUpSound),combo:t("combo",this.createComboSound),error:t("error",this.createErrorSound),buttonClick:t("buttonClick",this.createButtonClickSound),blockRotate:t("blockRotate",this.createBlockRotateSound),scoreGain:t("scoreGain",this.createScoreGainSound),timeWarning:t("timeWarning",this.createTimeWarningSound),timeCritical:t("timeCritical",this.createTimeCriticalSound),timeBonus:t("timeBonus",this.createTimeBonusSound),hint:t("hint",this.createHintSound),undo:t("undo",this.createUndoSound),redo:t("redo",this.createRedoSound),perfect:t("perfect",this.createPerfectSound),chain:t("chain",this.createChainSound)}}getSoundEffects(){return{blockPlace:{name:"Block Placement",description:"When placing a block on the board"},lineClear:{name:"Line Clear",description:"When clearing lines"},levelUp:{name:"Level Up",description:"When advancing to next level"},combo:{name:"Combo",description:"When achieving a combo"},error:{name:"Error",description:"When an invalid action occurs"},buttonClick:{name:"Button Click",description:"Button press feedback"},blockRotate:{name:"Block Rotate",description:"When rotating a block"},scoreGain:{name:"Score Gain",description:"When earning points"},timeWarning:{name:"Time Warning",description:"Low time warning"},timeCritical:{name:"Time Critical",description:"Very low time alert"},timeBonus:{name:"Time Bonus",description:"Bonus time awarded"},hint:{name:"Hint",description:"When using a hint"},undo:{name:"Undo",description:"Undo action"},redo:{name:"Redo",description:"Redo action"},perfect:{name:"Perfect Clear",description:"Perfect board clear"},chain:{name:"Chain",description:"Chain combo effect"}}}previewSound(t){if(!(!this.audioContext||!this.isEnabled))try{if(t==="none")return;const o=t==="default"?this.createBlockPlaceSound():this.soundPresets[t];if(!o)return;const e=this.audioContext.createBufferSource(),a=this.audioContext.createGain();e.buffer=o.buffer,e.connect(a),a.connect(this.audioContext.destination),a.gain.value=this.volume*o.volume,e.start()}catch(o){console.warn("Error previewing sound:",o)}}play(t){if(!(!this.isEnabled||!this.audioContext||!this.sounds[t]))try{const o=this.sounds[t];if(o===null)return;const e=this.audioContext.createBufferSource(),a=this.audioContext.createGain();e.buffer=o.buffer,e.connect(a),a.connect(this.audioContext.destination),a.gain.value=this.volume*o.volume,e.start()}catch(o){console.warn("Error playing sound:",o)}}createBlockPlaceSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.1,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate;o[e]=Math.sin(2*Math.PI*800*a)*Math.exp(-a*10)*.3}return{buffer:t,volume:.7}}createLineClearSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.3,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=400+Math.sin(a*20)*100;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*3)*.4}return{buffer:t,volume:.8}}createLevelUpSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.5,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=200+a*400;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*2)*.5}return{buffer:t,volume:.9}}createComboSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.2,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=600+Math.sin(a*30)*200;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*5)*.3}return{buffer:t,volume:.6}}createErrorSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.15,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=200-a*100;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*8)*.4}return{buffer:t,volume:.5}}createButtonClickSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.05,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate;o[e]=Math.sin(2*Math.PI*1e3*a)*Math.exp(-a*20)*.2}return{buffer:t,volume:.4}}createBlockRotateSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.08,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=300+Math.sin(a*50)*50;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*15)*.15}return{buffer:t,volume:.3}}createScoreGainSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.12,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=500+a*200;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*6)*.25}return{buffer:t,volume:.5}}createTimeWarningSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.2,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=300+Math.sin(a*10)*50;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*4)*.3}return{buffer:t,volume:.6}}createTimeCriticalSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.1,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=400+Math.sin(a*50)*100;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*8)*.4}return{buffer:t,volume:.7}}createTimeBonusSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.15,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=200+a*600;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*3)*.35}return{buffer:t,volume:.6}}createHintSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.25,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=150+Math.sin(a*8)*30;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*2)*.2}return{buffer:t,volume:.4}}createUndoSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.08,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=400-a*200;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*12)*.25}return{buffer:t,volume:.4}}createRedoSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.08,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=200+a*400;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*12)*.25}return{buffer:t,volume:.4}}createPerfectSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.6,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=100+a*800,i=Math.sin(2*Math.PI*n*a)+.5*Math.sin(2*Math.PI*n*2*a)+.25*Math.sin(2*Math.PI*n*3*a);o[e]=i*Math.exp(-a*1.5)*.4}return{buffer:t,volume:.8}}createChainSound(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.3,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=300+Math.sin(a*15)*100;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*2)*.3}return{buffer:t,volume:.5}}resume(){this.audioContext&&this.audioContext.state==="suspended"&&this.audioContext.resume()}stop(){this.audioContext&&(this.audioContext.close(),this.init())}createChimePreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.3,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=880;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*5)*.3+.5*Math.sin(2*Math.PI*n*2*a)*Math.exp(-a*5)*.3}return{buffer:t,volume:.7}}createBeepPreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.1,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate;o[e]=Math.sin(2*Math.PI*1200*a)*Math.exp(-a*15)*.3}return{buffer:t,volume:.6}}createPopPreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.08,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=300-a*200;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*20)*.4}return{buffer:t,volume:.7}}createSwooshPreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.2,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=100+a*400;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*6)*.25}return{buffer:t,volume:.5}}createDingPreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.25,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=1760;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*6)*.35}return{buffer:t,volume:.6}}createThudPreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.12,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate,n=100-a*50;o[e]=Math.sin(2*Math.PI*n*a)*Math.exp(-a*12)*.5}return{buffer:t,volume:.8}}createClickPreset(){const t=this.audioContext.createBuffer(1,this.audioContext.sampleRate*.04,this.audioContext.sampleRate),o=t.getChannelData(0);for(let e=0;e<o.length;e++){const a=e/this.audioContext.sampleRate;o[e]=Math.sin(2*Math.PI*1500*a)*Math.exp(-a*30)*.25}return{buffer:t,volume:.5}}}export{d as C,l as G,r as P,u as S,c as i};
