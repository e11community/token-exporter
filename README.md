# Overview

Find NPM auth tokens in **HOME/.npmrc** and export them as environment variables

# Installation

## Package

`npm install -g @e11community/token-exporter`

## Shell setup

In **HOME/.bashrc**, you have two options, and you *may do both* 

```
# OPTION 1: scoped tokens
if which export-tokens 2>&1 >/dev/null; then
  . <(export-tokens)
fi

# OPTION 2: personal access token
export NPM_AUTH_TOKEN=YourPersonalAccessTokenHere
```

# Project Usage

In **PROJECT_ROOT/.yarnrc.yml**, use environment variables instead of hard-coded tokens. It first tries to use the scope-specific token. If not found, it falls back to the personal access token. If neither is found, **yarn** throws an error.

```
npmScopes:
  e11community:
    npmAuthToken: ${E11COMMUNITY_NPM_AUTH_TOKEN:-$NPM_AUTH_TOKEN}
    npmPublishRegistry: "https://npm.pkg.github.com/e11community/"
    npmRegistryServer: "https://npm.pkg.github.com/e11community/"
  engineering11:
    npmAuthToken: ${ENGINEERING11_NPM_AUTH_TOKEN:-$NPM_AUTH_TOKEN}
    npmPublishRegistry: "https://npm.pkg.github.com/engineering11/"
    npmRegistryServer: "https://npm.pkg.github.com/engineering11/"
```

# Example

## Config

Given a **HOME/.npmrc** with redacted tokens:
```
@cnect:registry=https://npm.pkg.github.com/cnect/
//npm.pkg.github.com/cnect/:_authToken=SecretForCNect

@engineering11:registry=https://npm.pkg.github.com/engineering11/
//npm.pkg.github.com/engineering11/:_authToken=SecretForE11

@e11community:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/e11community/:_authToken=SecretForCommunity

@bit:registry=https://node.bit.dev
//node.bitsrc.io/:_authToken=SecretForBitProd
//node.bit.dev/:_authToken=SecretforBitDev

//npm.pkg.github.com/:_authToken=SecretForAllOfGitHub

registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=SecretForMainRegistry
```

## Expected Output

The **export-tokens** command should produce this script:

```
export CNECT_NPM_AUTH_TOKEN='SecretForCNect'
export ENGINEERING11_NPM_AUTH_TOKEN='SecretForE11'
export E11COMMUNITY_NPM_AUTH_TOKEN='SecretForAllOfGitHub'
```