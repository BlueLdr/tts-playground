module.exports = api => ({
  plugins: [
    [
      "module-resolver",
      {
        root: ["."],
        cwd: "packagejson",
        extensions: [".ts", ".tsx", ".json"],
        alias: {
          "~/*": "./src/*",
        },
      },
    ],
    "babel-plugin-transform-hook-names",
    [
      "@babel/plugin-transform-react-jsx",
      {
        pragma: "h",
      },
    ],
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: {
          version: 3,
          proposals: true,
        },
        ...(api.env("test") ? { targets: { node: "current" } } : {}),
      },
    ],
    ...(api.env("test") ? ["@babel/preset-typescript"] : []),
  ],
});
