# Bundler benchmark

1. Create the environemnt

```bash
make up
```

2. Wait for the environment to be ready (wait for the funding of smart accounts and deployment of contracts). You could check the status of the environment by running:

```bash
make logs-node
```

First 50 blocks it will spam with `eth_call` and other rpc methods, after it will finishing the spam node will be ready to use.

3. Run the benchmark (aka activate accounts)

```bash
make activate
```

It will send 500 activation transaction userops to the bundler which will appear as a blank screen. Then you will notice that userops will appear in chunks (10-15) userops each. The problem is that there is no way to increase limit of userops in one bundle.  