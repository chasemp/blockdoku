import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css             *//* empty css             */function m(){const i=localStorage.getItem("blockdoku_lastgame"),r=document.getElementById("game-stats-content");if(!i){r.innerHTML=`
                    <div class="no-stats-message">
                        <h2>No Game Data</h2>
                        <p>You haven't completed a game yet.</p>
                        <p>Play a game to see your stats here!</p>
                    </div>
                `;return}try{const e=JSON.parse(i),g=e.prizeRecognitionEnabled!==!1;let o="";g&&e.prize&&(o+=`
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
                        ${e.countdownEnabled?`
                            <p>⏳ Countdown: ${e.countdownDuration||3} min${e.timeRemaining!==null?` (${Math.max(0,Math.floor(e.timeRemaining/60))}:${String(Math.max(0,e.timeRemaining%60)).padStart(2,"0")} remaining)`:""}</p>
                        `:""}
                        ${e.piecesPlaced?`
                            <p>📊 Efficiency: ${e.pointsPerPiece.toFixed(1)} pts/piece (${e.piecesPlaced} pieces placed)</p>
                        `:""}
                        ${e.isHighScore?'<p class="high-score-badge">🎉 New High Score! 🎉</p>':""}
                    </div>
                `;const t=e.breakdown||{},l={rows:e.rowClears||0,columns:e.columnClears||0,squares:e.squareClears||0};if(o+=`
                    <div class="stats-grid">
                        <div class="stats-column">
                            <h3>Clears</h3>
                            <p>Rows: <strong>${l.rows}</strong></p>
                            <p>Columns: <strong>${l.columns}</strong></p>
                            <p>3x3 Squares: <strong>${l.squares}</strong></p>
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
                    `),e.speedStats&&e.speedMode!=="ignored"){const a={bonus:"Bonus Mode",punishment:"Punishment Mode",ignored:"Ignored Mode"},n=e.speedStats.averagePlacementSpeed||0,c=e.speedStats.fastestPlacement||0,s=e.speedStats.totalSpeedBonus||0,p=e.speedStats.totalPlacements||0;o+=`
                        <div class="petrification-stats" style="background: rgba(255, 165, 0, 0.08); border-color: rgba(255, 165, 0, 0.2);">
                            <h3 style="color: #ffa500;">⚡ Speed Timing Stats (${a[e.speedMode]||"Unknown"})</h3>
                            <p>Total Speed Bonus: <strong>${s.toLocaleString()} points</strong></p>
                            <p>Average Placement Time: <strong>${n.toFixed(1)}s</strong></p>
                            <p>Fastest Placement: <strong>${c.toFixed(1)}s</strong></p>
                            <p>Total Placements: <strong>${p}</strong></p>
                            ${p>0?`<p>Speed Bonus per Placement: <strong>${(s/p).toFixed(1)} points</strong></p>`:""}
                        </div>
                    `}r.innerHTML=o;const d=document.getElementById("share-score-btn");d&&d.addEventListener("click",async()=>{try{const a=(e.difficulty||"NORMAL").toUpperCase(),n=window.location.origin+window.location.pathname.replace("lastgame.html","index.html"),c=`Max Streak ${e.maxCombo}, Total Combos ${e.totalCombos||0}`,s=`I scored ${e.score.toLocaleString()} in Blockdoku (${a}) — Level ${e.level}, ${e.linesCleared} lines, ${c}!`;navigator.share?await navigator.share({title:"My Blockdoku Score",text:s,url:n}):navigator.clipboard&&navigator.clipboard.writeText?(await navigator.clipboard.writeText(`${s} ${n}`),alert("Share link copied to clipboard!")):window.prompt("Copy this to share:",`${s} ${n}`)}catch(a){console.error("Share failed:",a)}})}catch(e){console.error("Error loading last game stats:",e),r.innerHTML=`
                    <div class="no-stats-message">
                        <h2>Error Loading Stats</h2>
                        <p>There was a problem loading your last game data.</p>
                    </div>
                `}}document.getElementById("new-game-btn").addEventListener("click",i=>{localStorage.setItem("blockdoku_start_new_game","true")});document.addEventListener("DOMContentLoaded",m);
