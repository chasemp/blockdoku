import"./wood-BFBTfjaZ.js";/* empty css             */function g(){const s=localStorage.getItem("blockdoku_lastgame"),a=document.getElementById("game-stats-content");if(!s){a.innerHTML=`
                    <div class="no-stats-message">
                        <h2>No Game Data</h2>
                        <p>You haven't completed a game yet.</p>
                        <p>Play a game to see your stats here!</p>
                    </div>
                `;return}try{const e=JSON.parse(s),p=e.prizeRecognitionEnabled!==!1;let o="";p&&e.prize&&(o+=`
                        <div class="prize-section">
                            <div class="prize-emoji">${e.prize.emoji}</div>
                            <h3 class="prize-name">${e.prize.name}</h3>
                            <p class="prize-message">${e.prize.message}</p>
                            ${e.nextPrize?`
                                <div class="next-prize-section">
                                    <p class="next-prize-label">Next Prize: ${e.nextPrize.emoji} ${e.nextPrize.name}</p>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${e.nextPrizeProgress||0}%"></div>
                                    </div>
                                    <p class="points-needed">${(e.nextPrizePointsNeeded||0).toLocaleString()} points to go!</p>
                                </div>
                            `:`
                                <div class="highest-tier">
                                    <p>🏆 You've reached the highest tier! 🏆</p>
                                </div>
                            `}
                        </div>
                    `),o+=`
                    <div class="main-stats">
                        <p class="final-score">Final Score: ${e.score.toLocaleString()}</p>
                        <p>Level: ${e.level}</p>
                        <p>Lines Cleared: ${e.linesCleared}</p>
                        <p>Max Streak: ${e.maxCombo}</p>
                        <p>Total Combos: ${e.totalCombos||0}</p>
                        <p>Max Combo Streak: ${e.maxStreakCount||0}</p>
                        <p>Difficulty: ${(e.difficulty||"NORMAL").toUpperCase()} (x${e.difficultyMultiplier||1})</p>
                        ${e.isHighScore?'<p class="high-score-badge">🎉 New High Score! 🎉</p>':""}
                    </div>
                `;const t=e.breakdown||{},i={rows:e.rowClears||0,columns:e.columnClears||0,squares:e.squareClears||0};o+=`
                    <div class="stats-grid">
                        <div class="stats-column">
                            <h3>Clears</h3>
                            <p>Rows: <strong>${i.rows}</strong></p>
                            <p>Columns: <strong>${i.columns}</strong></p>
                            <p>3x3 Squares: <strong>${i.squares}</strong></p>
                        </div>
                        <div class="stats-column">
                            <h3>Score Breakdown</h3>
                            <p>Lines: <strong>${(t.linePoints||0).toLocaleString()}</strong></p>
                            <p>Squares: <strong>${(t.squarePoints||0).toLocaleString()}</strong></p>
                            <p>Placements: <strong>${(t.placementPoints||0).toLocaleString()}</strong></p>
                            <p>Combo Bonus: <strong>${(t.comboBonusPoints||0).toLocaleString()}</strong></p>
                            <p>Streak Bonus: <strong>${(t.streakBonusPoints||0).toLocaleString()}</strong></p>
                            <p class="total-score">Total: <strong>${((t.linePoints||0)+(t.squarePoints||0)+(t.placementPoints||0)+(t.comboBonusPoints||0)+(t.streakBonusPoints||0)).toLocaleString()}</strong></p>
                        </div>
                    </div>
                `,e.petrificationStats&&e.enablePetrification&&(o+=`
                        <div class="petrification-stats">
                            <h3>❄ Petrification Stats</h3>
                            <p>Grid Cells Petrified: <strong>${e.petrificationStats.gridCellsPetrified||0}</strong></p>
                            <p>Blocks Petrified: <strong>${e.petrificationStats.blocksPetrified||0}</strong></p>
                            <p>Grid Cells Thawed: <strong>${e.petrificationStats.gridCellsThawed||0}</strong></p>
                            <p>Blocks Thawed: <strong>${e.petrificationStats.blocksThawed||0}</strong></p>
                        </div>
                    `),a.innerHTML=o;const c=document.getElementById("share-score-btn");c&&c.addEventListener("click",async()=>{try{const r=(e.difficulty||"NORMAL").toUpperCase(),n=window.location.origin+window.location.pathname.replace("lastgame.html","index.html"),d=`Max Streak ${e.maxCombo}, Total Combos ${e.totalCombos||0}`,l=`I scored ${e.score.toLocaleString()} in Blockdoku (${r}) — Level ${e.level}, ${e.linesCleared} lines, ${d}!`;navigator.share?await navigator.share({title:"My Blockdoku Score",text:l,url:n}):navigator.clipboard&&navigator.clipboard.writeText?(await navigator.clipboard.writeText(`${l} ${n}`),alert("Share link copied to clipboard!")):window.prompt("Copy this to share:",`${l} ${n}`)}catch(r){console.error("Share failed:",r)}})}catch(e){console.error("Error loading last game stats:",e),a.innerHTML=`
                    <div class="no-stats-message">
                        <h2>Error Loading Stats</h2>
                        <p>There was a problem loading your last game data.</p>
                    </div>
                `}}document.getElementById("new-game-btn").addEventListener("click",s=>{localStorage.setItem("blockdoku_start_new_game","true")});document.addEventListener("DOMContentLoaded",g);
