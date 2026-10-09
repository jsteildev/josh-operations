/* Template config. make_batch.py writes a real config.js into each batch
   output folder with the correct batchId. Change the password here for
   local previews; for real batches, edit make_batch.py's default or pass
   --password. This gate is casual obfuscation, not real security. */
window.SWIPE_CONFIG = {
  password: "changeme",
  batchId: "dev"
};
