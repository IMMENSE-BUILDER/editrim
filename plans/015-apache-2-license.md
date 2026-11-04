# Apache License 2.0

The repository switched from MIT to the **Apache License, Version 2.0**.

## Changes

- `LICENSE` now contains the unmodified Apache 2.0 license text.
- `NOTICE` records the copyright holder and the third-party asset carve-outs.
- `package.json` and `package-lock.json` declare `"license": "Apache-2.0"`.
- `README.md` carries an Apache 2.0 badge and a license section that scopes the license to code and documentation.
- GitHub detects the license from `LICENSE`; the repository API should report `spdx_id: Apache-2.0`.

## Third-party assets

The Apache license does not relicense bundled third-party work:

- Template photos: Unsplash License.
- Fonts: their respective licenses, including SIL OFL for Geist Serif.
- Lucide design-content icons: ISC License.

## Verification

```text
gh api repos/IMMENSE-BUILDER/editrim --jq .license.spdx_id
# Apache-2.0
```
