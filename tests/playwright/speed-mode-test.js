/**
 * Speed Mode Testing Script
 * Tests bonus, ignored, and punishment modes for speed tracking
 */

import { chromium } from 'playwright';

async function testSpeedModes() {
    console.log('🧪 Speed Mode Testing - Starting Test');
    console.log('=====================================');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Navigate to the game
        console.log('📍 Step 1: Navigate to game');
        await page.goto('http://localhost:3456');
        await page.waitForLoadState('networkidle');
        
        // Take initial snapshot
        console.log('📸 Taking initial snapshot');
        const initialSnapshot = await page.accessibility.snapshot();
        console.log('Initial game state loaded');
        
        // Navigate to settings
        console.log('📍 Step 2: Navigate to settings');
        const settingsButton = await page.locator('button:has-text("Settings")').first();
        await settingsButton.click();
        await page.waitForLoadState('networkidle');
        
        // Go to game settings
        console.log('📍 Step 3: Navigate to game settings');
        const gameSettingsLink = await page.locator('a:has-text("Game Settings")').first();
        await gameSettingsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Test BONUS mode
        console.log('\n🎯 Testing BONUS Mode');
        console.log('====================');
        await testSpeedMode(page, 'bonus');
        
        // Test IGNORED mode
        console.log('\n🎯 Testing IGNORED Mode');
        console.log('======================');
        await testSpeedMode(page, 'ignored');
        
        // Test PUNISHMENT mode
        console.log('\n🎯 Testing PUNISHMENT Mode');
        console.log('==========================');
        await testSpeedMode(page, 'punishment');
        
        console.log('\n✅ All speed mode tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

async function testSpeedMode(page, mode) {
    try {
        // Set speed mode
        console.log(`🔧 Setting speed mode to: ${mode.toUpperCase()}`);
        
        // Find and click the speed mode selector
        const speedModeSelect = await page.locator('select[name="speedMode"], select[id*="speed"]').first();
        if (await speedModeSelect.isVisible()) {
            await speedModeSelect.selectOption(mode);
            console.log(`✅ Speed mode set to: ${mode}`);
        } else {
            console.log('⚠️  Speed mode selector not found, trying alternative approach');
            // Try to find radio buttons or other controls
            const modeButtons = await page.locator(`input[value="${mode}"], button:has-text("${mode}")`).all();
            if (modeButtons.length > 0) {
                await modeButtons[0].click();
                console.log(`✅ Speed mode set to: ${mode} via button`);
            } else {
                console.log('❌ Could not find speed mode controls');
                return;
            }
        }
        
        // Go back to game
        console.log('🎮 Returning to game');
        const backToGameButton = await page.locator('button:has-text("Back to Game"), a:has-text("Back to Game")').first();
        await backToGameButton.click();
        await page.waitForLoadState('networkidle');
        
        // Play 10 moves and record scoring
        console.log(`🎲 Playing 10 moves in ${mode.toUpperCase()} mode`);
        const scores = [];
        
        for (let i = 1; i <= 10; i++) {
            console.log(`   Move ${i}/10...`);
            
            // Get initial score
            const scoreElement = await page.locator('#score, .score, [class*="score"]').first();
            const initialScore = await scoreElement.textContent();
            const initialScoreNum = parseInt(initialScore?.replace(/[^\d]/g, '') || '0');
            
            // Wait a bit to simulate thinking time (varies by mode)
            const waitTime = mode === 'bonus' ? 500 : mode === 'ignored' ? 1000 : 2000;
            await page.waitForTimeout(waitTime);
            
            // Try to place a block
            try {
                // Look for available blocks
                const blocks = await page.locator('.block-item, [class*="block"]').all();
                if (blocks.length > 0) {
                    // Click the first available block
                    await blocks[0].click();
                    await page.waitForTimeout(100);
                    
                    // Try to place it on the board
                    const board = await page.locator('#game-board, .game-board, canvas').first();
                    if (await board.isVisible()) {
                        const box = await board.boundingBox();
                        if (box) {
                            // Click in the center of the board
                            await page.mouse.click(
                                box.x + box.width / 2,
                                box.y + box.height / 2
                            );
                            await page.waitForTimeout(200);
                        }
                    }
                }
            } catch (error) {
                console.log(`     ⚠️  Could not place block: ${error.message}`);
            }
            
            // Get final score
            const finalScore = await scoreElement.textContent();
            const finalScoreNum = parseInt(finalScore?.replace(/[^\d]/g, '') || '0');
            
            const scoreChange = finalScoreNum - initialScoreNum;
            scores.push(scoreChange);
            
            console.log(`     Score change: ${scoreChange > 0 ? '+' : ''}${scoreChange}`);
            
            // Wait between moves
            await page.waitForTimeout(500);
        }
        
        // Analyze results
        console.log(`📊 ${mode.toUpperCase()} Mode Results:`);
        console.log(`   Total score changes: ${scores.join(', ')}`);
        console.log(`   Average change: ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)}`);
        console.log(`   Positive changes: ${scores.filter(s => s > 0).length}/10`);
        console.log(`   Negative changes: ${scores.filter(s => s < 0).length}/10`);
        console.log(`   Zero changes: ${scores.filter(s => s === 0).length}/10`);
        
        // Expected behavior analysis
        if (mode === 'bonus') {
            console.log(`   ✅ Expected: Mostly positive changes from speed bonuses`);
        } else if (mode === 'ignored') {
            console.log(`   ✅ Expected: No speed-related changes (only placement points)`);
        } else if (mode === 'punishment') {
            console.log(`   ✅ Expected: Some negative changes from slow placements`);
        }
        
    } catch (error) {
        console.error(`❌ Error testing ${mode} mode:`, error);
    }
}

// Run the test
testSpeedModes().catch(console.error);
