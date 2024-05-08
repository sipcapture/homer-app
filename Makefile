NAME=homer-app

all:
	CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w" -buildvcs=false -o $(NAME) 
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

binary:
	./scripts/build_binary.sh

bundle:
	./scripts/build_binary.sh
	./scripts/build_frontend.sh
	./scripts/build_package.sh

.PHONY: clean
clean:
	rm -fr $(NAME)
