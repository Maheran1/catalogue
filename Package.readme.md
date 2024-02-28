{
  "name": "salon-web",
  "version": "0.1.0",
  "author": "Danny",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "npm run lint:scss && npm run lint:js",
    "lint:scss": "stylelint 'app/**/*.scss' --syntax scss --fix ; exit 0",
    "lint:js": "eslint . --ext .tsx",
    "type:check": "tsc"
  },
  "dependencies": {
    "@babel/core": "^7.12.17",
    "@material-ui/core": "^4.11.3",
    "clsx": "^1.1.1",
    "moment": "^2.29.1",
    "next": "^10.0.7",
    "node-fetch": "^2.6.1",
    "react": "17.0.0",
    "react-alice-carousel": "^2.4.0",
    "react-device-detect": "^1.15.0",
    "react-dom": "17.0.0",
    "react-redux": "^7.2.2",
    "redux": "^4.0.5",
    "sass": "^1.27.0"
  },
  "devDependencies": {
    "@babel/preset-react": "^7.12.1",
    "@types/node": "^14.14.5",
    "@types/react": "^16.9.54",
    "@typescript-eslint/eslint-plugin": "^4.6.0",
    "@typescript-eslint/parser": "^4.6.0",
    "axios": "^0.21.1",
    "eslint": "^7.12.1",
    "eslint-plugin-react": "^7.21.5",
    "husky": "^4.3.0",
    "identity-obj-proxy": "^3.0.0",
    "lint-staged": "^10.5.0",
    "stylelint": "^13.7.2",
    "stylelint-config-idiomatic-order": "^8.1.0",
    "ts-node": "^9.0.0",
    "typescript": "^4.0.5"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*": "prettier --write --ignore-unknown",
    "*.{js,jsx,ts,tsx}": "eslint",
    "*.{css,scss}": "stylelint"
  }
}
