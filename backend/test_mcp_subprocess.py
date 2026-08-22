import asyncio
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from app.config import get_settings

settings = get_settings()

async def main():
    env = dict(os.environ)
    if settings.clickhouse_host:
        env["CLICKHOUSE_HOST"] = settings.clickhouse_host
        env["CLICKHOUSE_PORT"] = str(settings.clickhouse_port)
        env["CLICKHOUSE_USER"] = settings.clickhouse_username
        env["CLICKHOUSE_PASSWORD"] = settings.clickhouse_password
        env["CLICKHOUSE_DATABASE"] = settings.clickhouse_database
        env["CLICKHOUSE_SECURE"] = "true"

    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-c", "from mcp_clickhouse.mcp_server import mcp; mcp.run(transport='stdio')"],
        env=env
    )

    print(">>> [MCP Client] Spawning mcp-clickhouse subprocess over stdio transport...")
    async with stdio_client(server_params) as (read, write):
        print(">>> [MCP Client] Subprocess pipes (read/write) established. Initializing MCP ClientSession...")
        async with ClientSession(read, write) as session:
            init_res = await session.initialize()
            print(">>> [MCP Protocol] Handshake Successful! Server Info:", init_res.serverInfo)
            
            tools_res = await session.list_tools()
            print(">>> [MCP Protocol] Discovered tools via session.list_tools():", [t.name for t in tools_res.tools])
            
            print(">>> [MCP Protocol] Calling tool 'run_query' via session.call_tool()...")
            result = await session.call_tool("run_query", arguments={"query": "SELECT count() as scene_count FROM scenes"})
            print(">>> [MCP Protocol] Tool Call Response Received:")
            print(result)

if __name__ == "__main__":
    asyncio.run(main())
