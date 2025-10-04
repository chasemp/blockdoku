#!/bin/bash

echo "🔧 Pushing Countdown Timer Fix to PR #110"
echo "=========================================="
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Commits to push: $(git log origin/cursor/investigate-and-fix-countdown-timer-bug-f86a..HEAD --oneline | wc -l)"
echo ""
echo "Latest commit:"
git log -1 --oneline
echo ""
echo "Files changed in this commit:"
git diff-tree --no-commit-id --name-only -r HEAD | head -10
echo ""
read -p "Push this fix to origin? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Pushing..."
    git push origin cursor/investigate-and-fix-countdown-timer-bug-f86a
    echo ""
    echo "✅ Fix pushed successfully!"
    echo ""
    echo "PR #110: https://github.com/chasemp/blockdoku/pull/110"
else
    echo "❌ Push cancelled"
fi
