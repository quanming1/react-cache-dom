import { Configuration } from "webpack";
import path from "path";

function resolve(p: string): string {
  return path.resolve(__dirname, p);
}

const webpackConfig: Configuration = {
  mode: "production",
  entry: resolve("./src/index.ts"),
  output: {
    path: resolve("./dist"),
    filename: "index.js",
    library: "react-cache-dom",
    libraryTarget: "umd",
    globalObject: "this",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React",
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM",
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { targets: "defaults" }], "@babel/preset-react", "@babel/preset-typescript"],
            },
          },
        ],
      },
    ],
  },
  cache: {
    type: "filesystem",
  },
  optimization: {
    minimize: true,
  },
};

export default webpackConfig;
