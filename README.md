# Overview

Find NPM auth tokens in **HOME/.npmrc** and export them as environment variables

# Installation

## Package

`npm install -g @e11community/token-exporter`

## Shell setup

In **HOME/.bashrc**, you have two options, and you *may do both*:

1. Use the node package to dynamically generate a bash script to source
2. Use your **personal access token** everywhere

```
# OPTION 1: dynamically generated tokens
if which npmrc-export 2>&1 >/dev/null; then
  . <(npmrc-export)
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
@engineering11:registry=https://npm.pkg.github.com/engineering11/
//npm.pkg.github.com/engineering11/:_authToken=SecretForE11

@e11community:registry=https://npm.pkg.github.com/e11community/
//npm.pkg.github.com/e11community/:_authToken=SecretForCommunity

@bit:registry=https://node.bit.dev/
//node.bitsrc.io/:_authToken=SecretForBitProd
//node.bit.dev/:_authToken=SecretForBitDev

//npm.pkg.github.com/:_authToken=SecretForAllOfGitHub

registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=SecretForMainRegistry
```

## Expected Output

The **npmrc-export | sort** command *should* produce this script:

```
export BIT_NPM_AUTH_TOKEN='SecretForBitDev'
export E11COMMUNITY_NPM_AUTH_TOKEN='SecretForCommunity'
export ENGINEERING11_NPM_AUTH_TOKEN='SecretForE11'
```

# Write Local .npmrc

## Workflow for AppEngine Deploys
**NOTE:** this is the _verbose_ way, without any scripts
```
cd BACKEND_REPO/microservices/service-FOO/microservice/

cat template.yaml | envsubst > app.yaml

npmrc-write-cwd

gcloud app deploy app.yaml --project=PROJECT_ID
```

## Workflow for Function Deploys
**NOTE:** this is the _verbose_ way, without any scripts
```
cd BACKEND_REPO/microservices/service-FOO/functions/

npmrc-write-cwd

firebase deploy --only functions:FOO --project=PROJECT_ID
```

## Notes

* **DO** put **.npmrc** in **.gitignore**
* Do **NOT** put **.npmrc** in **.gcloudignore**
