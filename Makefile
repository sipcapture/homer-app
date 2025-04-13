NAME=homer-app
GOOS ?= linux

all:
	CGO_ENABLED=0 GOOS=$(GOOS) go build -ldflags "-s -w" -buildvcs=false -o $(NAME) 
	#go build -a -ldflags '-extldflags "-static"' -o $(NAME) 

debug:
	go build -o $(NAME)

modules:
	go get ./...

docker:
	./scripts/build_docker.sh

package:
	./scripts/build_package.sh

frontend:
	./scripts/build_frontend.sh

localfe:
	./scripts/build_local_frontend.sh

binary:
	./scripts/build_binary.sh

bundle:
	./scripts/build_binary.sh
	./scripts/build_frontend.sh
	./scripts/build_package.sh

.PHONY: clean
clean:
	rm -fr $(NAME)
