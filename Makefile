CMD := node -e "console.log(JSON.parse(fs.readFileSync('./package.json', 'utf8'))['version']);"
VERSION := $(shell $(CMD))

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

.npmrc:  # Generate .npmrc file
	@if [ -z ${NPM_LOCAL_REGISTRY} ]; then echo "Please set the NPM_LOCAL_REGISTRY environment variable before attempting to publish."; exit 1; fi
	echo "//$(shell echo "$${NPM_LOCAL_REGISTRY}" | sed -r 's/[0-9A-Za-z]*:?\/\/(.*)/\1/'):_authToken=\$${NPM_LOCAL_TOKEN}" >> .npmrc

publish: dist .npmrc  ## Publish to local NPM registry
	@if [ -z ${NPM_LOCAL_REGISTRY} ]; then echo "Please set the NPM_LOCAL_REGISTRY environment variable before attempting to publish."; exit 1; fi
	npm publish --registry "${NPM_LOCAL_REGISTRY}"
.PHONY: link

package: dist  ## Create package for deployment
	tar czvf dist/noaa-cmi-${VERSION}.tar.gz --transform 's/^dist\//noaa-cmi\/${VERSION}\/js\//' --exclude '*.tar.gz' dist/*.js
.PHONY: package
