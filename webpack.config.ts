import { Configuration } from "webpack";
import path from "path";

function resolve(p: string) {
  return path.resolve(__dirname, p);
}

const webpackConfig: Configuration = {
  mode: "production",
  entry: resolve("./src/index.ts"),
  output: {
    path: resolve("./dist"),
    filename: "index.js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", "..."],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
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
