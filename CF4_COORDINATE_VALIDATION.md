# CF4 coordinate validation note

Validation performed against the public CF4 documentation before enabling a browser render.

- The authoritative 2026 density/velocity release describes the cube axis order as **(SGZ, SGY, SGX)** and a **1000 Mpc/h, 128^3** domain.
- The Cosmicflows project page likewise labels downloadable grids (SGZ, SGY, SGX) and documents the velocity scaling of its downloadable products.
- The EDD CF4 API returns peculiar velocity components explicitly as SG_Vx, SG_Vy, SG_Vz.
- The Laniakea fork's shared coordinate utility uses a centered Cartesian cube with cell centers at -L/2 + (i+0.5)L/N.

## Important unresolved unit boundary

The Laniakea visualization pipeline currently documents/uses a 1000 **Mpc** cube, while the authoritative 2026 Zenodo grid description states 1000 **Mpc/h**. Uranometria must therefore preserve upstream units as metadata and must **not** silently relabel or rescale the cube. A production adapter should accept an explicit `--length-unit Mpc|Mpc/h` selected from the exact source product being ingested.

This is a scientific-release blocker, not a rendering blocker: a preview may render normalized coordinates, but scale labels must remain provisional until the exact upstream file/version is bound.
