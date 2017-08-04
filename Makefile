

help: ## Show this help message
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##/:/'`); \
	printf "%-30s %s\n" "target" "help" ; \
	printf "%-30s %s\n" "------" "----" ; \
	for help_line in $${help_lines[@]}; do \
	  IFS=$$':' ; \
	  help_split=($$help_line) ; \
	  help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	  help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	  printf '\033[36m'; \
	  printf "%-30s %s" $$help_command ; \
	  printf '\033[0m'; \
	  printf "%s\n" $$help_info; \
	done
.PHONY: help

node_modules:
	npm install

dist: | node_modules
	npm run build

clean:  ## Remove generated files
	rm -rf dist node_modules
.PHONY: clean

install:  ## Install npm files
	npm install
.PHONY: install

dev: node_modules  ## Set up development environment
	npm run dev
.PHONY: dev

build: node_modules  ## Build distributable files
	npm run build
.PHONY: build

test: node_modules  ## Run tests
	npm run test
.PHONY: test

publish: dist  ## Publish to local NPM registry
	@if [ -z ${NPM_LOCAL_USER} ]; then echo "Please set the NPM_LOCAL_USER environment variable before attempting to publish."; exit 1; fi
	@if [ -z ${NPM_LOCAL_PASSWORD} ]; then echo "Please set the NPM_LOCAL_PASSWORD environment variable before attempting to publish."; exit 1; fi
	@if [ -z ${NPM_LOCAL_EMAIL} ]; then echo "Please set the NPM_LOCAL_EMAIL environment variable before attempting to publish."; exit 1; fi
	@if [ -z ${NPM_LOCAL_REGISTRY} ]; then echo "Please set the NPM_LOCAL_REGISTRY environment variable before attempting to publish."; exit 1; fi
	echo -e "${NPM_LOCAL_USER}\n${NPM_LOCAL_PASSWORD}\n${NPM_LOCAL_EMAIL}" | npm login --registry "${NPM_LOCAL_REGISTRY}"
	npm publish --registry "${NPM_LOCAL_REGISTRY}"
.PHONY: link

package: dist  ## Create package for deployment
	@if [ -z ${VERSION} ]; then echo "Please set the VERSION environment variable before building a package."; exit 1; fi
	tar czvf dist/noaa-cmi-${VERSION}.tar.gz --transform 's/^dist\//noaa-cmi\/${VERSION}\/js\//' dist/*.js
.PHONY: package
