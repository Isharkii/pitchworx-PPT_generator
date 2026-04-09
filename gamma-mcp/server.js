const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const z = require("zod/v4");

const GAMMA_LLM_INDEX_URL = "https://developers.gamma.app/llms.txt";
const GAMMA_LLM_FULL_URL = "https://developers.gamma.app/llms-full.txt";
const GAMMA_BASE_API_URL = "https://public-api.gamma.app/v1.0";
const DEFAULT_MAX_DOC_CHARS = 20000;
const MAX_DOC_CHARS = 50000;

function clampDocLength(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_DOC_CHARS;
  }

  return Math.min(Math.max(Math.trunc(value), 1000), MAX_DOC_CHARS);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "gamma-mcp/1.0.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function splitMarkdownSections(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let currentHeading = "Overview";
  let currentLines = [];

  const pushSection = () => {
    const text = currentLines.join("\n").trim();

    if (!text) {
      return;
    }

    sections.push({
      heading: currentHeading,
      text
    });
  };

  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line)) {
      pushSection();
      currentHeading = line.replace(/^#{1,3}\s+/, "").trim();
      currentLines = [line];
      continue;
    }

    currentLines.push(line);
  }

  pushSection();
  return sections;
}

function buildDocsPayload(markdown, query, maxChars) {
  const trimmedQuery = query?.trim();
  const sections = splitMarkdownSections(markdown);
  let relevantText = markdown;
  let matchedSections = [];

  if (trimmedQuery) {
    const normalizedQuery = trimmedQuery.toLowerCase();
    const matches = sections.filter((section) => {
      const haystack = `${section.heading}\n${section.text}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    if (matches.length > 0) {
      matchedSections = matches.map((section) => section.heading);
      relevantText = matches.map((section) => section.text).join("\n\n");
    }
  }

  const returnedText = relevantText.slice(0, maxChars);

  return {
    sourceUrl: GAMMA_LLM_FULL_URL,
    query: trimmedQuery || null,
    content: returnedText,
    totalChars: relevantText.length,
    returnedChars: returnedText.length,
    truncated: relevantText.length > returnedText.length,
    matchedSections
  };
}

function parseEndpoints(indexMarkdown) {
  const endpointPattern =
    /^- \[(?<method>[A-Z]+) (?<path>\/[^\]]+)\]\((?<docPath>[^)]+)\): (?<description>.+)$/gm;

  return Array.from(indexMarkdown.matchAll(endpointPattern)).map((match) => ({
    method: match.groups.method,
    path: match.groups.path,
    description: match.groups.description.trim(),
    docsUrl: new URL(match.groups.docPath, "https://developers.gamma.app").href
  }));
}

function filterEndpoints(endpoints, method, query) {
  const normalizedMethod = method?.trim().toUpperCase();
  const normalizedQuery = query?.trim().toLowerCase();

  return endpoints.filter((endpoint) => {
    const methodMatches = normalizedMethod ? endpoint.method === normalizedMethod : true;
    const queryMatches = normalizedQuery
      ? `${endpoint.method} ${endpoint.path} ${endpoint.description}`
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    return methodMatches && queryMatches;
  });
}

function formatEndpointsText(payload) {
  const lines = [
    `Gamma API base URL: ${payload.baseApiUrl}`,
    `Source: ${payload.sourceUrl}`,
    `Returned endpoints: ${payload.count}`
  ];

  if (payload.method) {
    lines.push(`Method filter: ${payload.method}`);
  }

  if (payload.query) {
    lines.push(`Query filter: ${payload.query}`);
  }

  lines.push("");

  for (const endpoint of payload.endpoints) {
    lines.push(`${endpoint.method} ${endpoint.path}`);
    lines.push(`Description: ${endpoint.description}`);
    lines.push(`Docs: ${endpoint.docsUrl}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

function formatDocsText(payload) {
  const lines = [
    `Source: ${payload.sourceUrl}`,
    `Returned chars: ${payload.returnedChars}/${payload.totalChars}`
  ];

  if (payload.query) {
    lines.push(`Query: ${payload.query}`);
  }

  if (payload.matchedSections.length > 0) {
    lines.push(`Matched sections: ${payload.matchedSections.join(", ")}`);
  }

  if (payload.truncated) {
    lines.push(`Truncated: yes (max ${payload.returnedChars} chars)`);
  }

  lines.push("");
  lines.push(payload.content);

  return lines.join("\n");
}

const server = new McpServer({
  name: "gamma-docs",
  version: "1.0.0"
});

server.registerTool(
  "get_gamma_docs",
  {
    title: "Get Gamma Docs",
    description: "Fetch Gamma's official machine-readable docs, optionally filtered by a keyword.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe("Optional keyword or topic to focus the returned docs on, such as 'template', 'themes', or 'MCP'."),
      maxChars: z
        .number()
        .int()
        .positive()
        .max(MAX_DOC_CHARS)
        .optional()
        .describe(`Maximum number of characters to return. Defaults to ${DEFAULT_MAX_DOC_CHARS}.`)
    },
    outputSchema: {
      sourceUrl: z.string(),
      query: z.string().nullable(),
      content: z.string(),
      totalChars: z.number().int().nonnegative(),
      returnedChars: z.number().int().nonnegative(),
      truncated: z.boolean(),
      matchedSections: z.array(z.string())
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ query, maxChars }) => {
    try {
      const markdown = await fetchText(GAMMA_LLM_FULL_URL);
      const payload = buildDocsPayload(markdown, query, clampDocLength(maxChars));

      return {
        content: [
          {
            type: "text",
            text: formatDocsText(payload)
          }
        ],
        structuredContent: payload
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch Gamma docs: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_gamma_endpoints",
  {
    title: "Get Gamma Endpoints",
    description: "List Gamma API endpoints from Gamma's official machine-readable docs index.",
    inputSchema: {
      method: z
        .string()
        .optional()
        .describe("Optional HTTP method filter, such as GET or POST."),
      query: z
        .string()
        .optional()
        .describe("Optional keyword filter for endpoint path or description.")
    },
    outputSchema: {
      sourceUrl: z.string(),
      baseApiUrl: z.string(),
      method: z.string().nullable(),
      query: z.string().nullable(),
      count: z.number().int().nonnegative(),
      endpoints: z.array(
        z.object({
          method: z.string(),
          path: z.string(),
          description: z.string(),
          docsUrl: z.string()
        })
      )
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ method, query }) => {
    try {
      const indexMarkdown = await fetchText(GAMMA_LLM_INDEX_URL);
      const endpoints = filterEndpoints(parseEndpoints(indexMarkdown), method, query);
      const payload = {
        sourceUrl: GAMMA_LLM_INDEX_URL,
        baseApiUrl: GAMMA_BASE_API_URL,
        method: method?.trim().toUpperCase() || null,
        query: query?.trim() || null,
        count: endpoints.length,
        endpoints
      };

      return {
        content: [
          {
            type: "text",
            text: formatEndpointsText(payload)
          }
        ],
        structuredContent: payload
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch Gamma endpoints: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("gamma-mcp server is running on stdio");
}

main().catch((error) => {
  console.error("gamma-mcp server error:", error);
  process.exit(1);
});
