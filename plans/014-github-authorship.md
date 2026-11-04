# GitHub contribution authorship

Commits in this repository were authored as `immense.builder@users.noreply.github.com`, which GitHub does not associate with the `IMMENSE-BUILDER` account. The API reported `author: null`, so the work did not count toward the contribution graph.

## Fix

- The repository now uses the verified email already present on this account's counted commits.
- All commits were rewritten with that author and committer email, preserving author dates and messages.
- `main` was force-pushed with `--force-with-lease`. A full pre-rewrite backup bundle was kept at `%TEMP%\opencode\editrim-pre-email-rewrite.bundle`.
- The remote HEAD now reports `author: IMMENSE-BUILDER` from the GitHub API.

## Note on dates

GitHub assigns contributions by **UTC** date. Work done late on 3 November in IST (UTC+5:30) falls on 3 November in the graph; work after 05:30 IST on 4 November falls on 4 November. Profile recalculation after a history rewrite can take a few minutes to a day.
