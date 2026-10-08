# Laniakea / CF4 adapter v0.1

This adapter converts the lightweight CSV products emitted by the external Laniakea pipeline into browser-ready Uranometria JSON.

## Inputs
- `CF4_galaxies_with_basin_id.csv`: SGX/SGY/SGZ galaxy positions plus reconstructed basin ID.
- `CF4_streams_streamlines.csv`: RK4 streamline vertices plus basin ID.

## Outputs
- `data/cf4/galaxies.json`
- `data/cf4/streamlines.json`

No FITS, NPY, or large CSV source products are copied into Uranometria.

## Scientific boundary
Galaxy catalogue positions and reconstructed basin membership are not the same evidence class. Streamlines are reconstruction products. The upstream streamline integrator normalizes the velocity vector before RK4 integration, so its path geometry encodes flow topology, **not velocity magnitude**.

Before a scientific release, verify upstream array-axis ordering and SG coordinate transforms against authoritative CF4 reference products. The adapter deliberately does not silently correct or reinterpret upstream coordinates.

## Mobile contract
The normalized JSON is an intermediate product. The browser layer can subsequently tile/quantize it, load named structures first, and fetch dense streamlines only when the user enables the flow layer.
