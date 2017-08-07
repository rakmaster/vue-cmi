# noaa-cmi

Core code for NWS CMI interface.

## Setup

For a production build, run `make build`.

For development, run `make dev`.

## Packaging

Run `make package` to create a tar.gz archive of the distributable products.

The VERSION environment variable must be defined for this operation.

## Publishing (internal registry only)

Run `make publish`.  The following environment variables must be defined for this command:

* NPM_LOCAL_USER
* NPM_LOCAL_PASSWORD
* NPM_LOCAL_EMAIL
* NPM_LOCAL_REGISTRY
