#!/bin/bash

git fetch https://github.com/extendify-mod/extendify master:upstream-dev
git stash
git checkout master
git rebase upstream-dev
git push --force origin master
