up:
	docker-compose up -d

down:
	docker-compose down

logs-node:
	docker-compose logs eth_node -f

logs-bundler:
	docker-compose logs bundler -f

activate:
	docker-compose exec eth_node npm run activate