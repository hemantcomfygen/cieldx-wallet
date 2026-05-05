import { NEWSDATA_API_KEY } from "./config.js";

const BASE_URL = "https://newsdata.io/api/1/news";

const normalizeNews = (articles = []) =>
  articles.map((item) => ({
    id: item.article_id || item.link || `${item.source_id || "news"}_${item.pubDate || ""}_${item.title || ""}`,
    title: item.title || "",
    description: item.description || "",
    image: item.image_url || "",
    url: item.link || "",
    source: item.source_id || "",
    publishedAt: item.pubDate || "",
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
  }));

/**
 * Fetch crypto/blockchain news with server-driven pagination.
 * NewsData uses `nextPage` token; pass it back as `page`.
 */
export async function fetchCryptoNews({
  page = null,
  pageSize = 12,
  query = "crypto OR blockchain",
} = {}) {
  try {
    const safeSize = Math.max(1, Math.min(9, Number(pageSize) || 9));
    const url = new URL(BASE_URL);
    url.searchParams.set("apikey", NEWSDATA_API_KEY);
    url.searchParams.set("q", query);
    url.searchParams.set("language", "en");
    url.searchParams.set("category", "business");
    url.searchParams.set("size", String(safeSize));

    if (page) url.searchParams.set("page", page);

    const response = await fetch(url);
    const data = await response.json();

    if (data?.status !== "success") {
      throw new Error(data?.message || "Failed to fetch news");
    }

    return {
      success: true,
      data: normalizeNews(data.results || []),
      nextPage: data.nextPage || null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      nextPage: null,
      message: error?.message || "Failed to fetch news",
    };
  }
}

