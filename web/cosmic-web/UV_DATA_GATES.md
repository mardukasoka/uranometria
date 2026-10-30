# UV data gates

NASA SkyView's GALEX AIS mosaic was documented as using GR6 data as of 2011; it is not a GR7 coverage oracle. MAST is the authoritative GALEX GR7 archive. Do not treat a SkyView JPEG, successful HTTP response, or empty pixels as proof of GR7 exposure, WCS registration, or non-detection. Confirm actual overlapping MAST image tiles, per-band exposure maps and calibrated FITS WCS before enabling UV verified status.

UV viewer is currently on draft PR #5 and not confirmed deployed. The six-direction multiwavelength expansion and CMZ panorama remain gated on validated UV deployment.
