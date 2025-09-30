#!/bin/bash
cd /workspace
export GIT_EDITOR=true
git rebase --continue
echo "Rebase status:"
git status
git log --oneline -5