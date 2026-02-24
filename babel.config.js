module.exports = function (api) {
  api.cache(true);
  return {
    // `nativewind/babel` exports a configuration object containing its own
    // `plugins` array, so it must be treated as a *preset* rather than a
    // plugin. Placing it under `plugins` causes Babel to complain with
    // ".plugins is not a valid Plugin property" (see error above).
    //
    // See https://www.nativewind.dev/installation for installation
    // instructions; the default example shows it in `presets`.
    presets: ["babel-preset-expo", "nativewind/babel"],
    plugins: [],
  };
};
