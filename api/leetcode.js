export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Validate request body
    const { query, variables } = req.body || {};

    if (!query || !variables?.username) {
      return res.status(400).json({
        error: "Invalid request: query and username are required",
      });
    }

    // ✅ Optional: sanitize username (extra safety)
    const username = variables.username.trim();

    if (!/^[a-zA-Z0-9_-]{1,15}$/.test(username)) {
      return res.status(400).json({
        error: "Invalid username format",
      });
    }

    // ✅ Forward request to LeetCode GraphQL
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    // ✅ Handle non-OK response
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch from LeetCode",
      });
    }

    const data = await response.json();

    // ✅ Handle GraphQL errors
    if (data.errors) {
      return res.status(400).json({
        error: data.errors[0]?.message || "GraphQL error",
      });
    }

    // ✅ Success
    return res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
