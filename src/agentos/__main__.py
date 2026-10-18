"""`python -m agentos`: read the startup config from the environment and serve the app."""

import os
import sys

import uvicorn

from agentos.app.config import ConfigError, load_config
from agentos.app.main import create_app


def main() -> int:
    try:
        config = load_config(os.environ)
    except ConfigError as error:
        print("AgentOS can't start, the environment is wrong:", file=sys.stderr)
        print("\n".join(f"  {p}" for p in error.problems), file=sys.stderr)
        return 2
    uvicorn.run(create_app(), host=config.host, port=config.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
