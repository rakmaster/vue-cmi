# vue-cmi

Openlayers for vue.js

## Setup

For a production build, run `make build`.

For development, run `make dev`.

## Packaging

Run `make package` to create a tar.gz archive of the distributable products.

The VERSION environment variable must be defined for this operation.

## Publishing (internal registry only)

Run `make publish`.  The following environment variables must be defined for this command:

* NPM_LOCAL_REGISTRY: the URL for the internal registry
* NPM_LOCAL_TOKEN: the npm authentication token (use [npm adduser] to generate a new token if needed and check ~/.npmrc)

[npm adduser]: https://docs.npmjs.com/cli/adduser
