package com.example.selfcarehero.ai

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Locale

data class WebSearchSource(
    val title: String,
    val snippet: String,
    val url: String
)

sealed class WebSearchResult {
    data class Success(val sources: List<WebSearchSource>, val query: String) : WebSearchResult()
    data class Offline(val message: String) : WebSearchResult()
    data class Error(val message: String) : WebSearchResult()
}

/**
 * OnlineSearchService:
 * Provides privacy-respecting, on-device web research retrieval for BloomQuest Local AI.
 * 
 * Guarantees:
 * 1. Zero proprietary API keys or secrets embedded in the APK.
 * 2. Uses public, standard knowledge APIs (e.g. Wikipedia Search API) with HTTPS.
 * 3. Sanitizes all retrieved web content as UNTRUSTED content before passing to local models.
 * 4. Stays strictly offline when disabled or when network is unreachable (airplane mode).
 */
object OnlineSearchService {

    private const val CONNECT_TIMEOUT_MS = 4000
    private const val READ_TIMEOUT_MS = 5000
    private const val MAX_SNIPPETS = 3
    private const val MAX_SNIPPET_LENGTH = 320

    /**
     * Determines whether the user query benefits from external web research.
     */
    fun shouldPerformOnlineSearch(query: String): Boolean {
        val q = query.lowercase(Locale.ROOT).trim()
        val searchKeywords = listOf(
            "who is", "who was", "who wrote", "what is the history of",
            "search", "lookup", "research", "latest study", "scientific evidence",
            "what does the science say", "neuroscience of", "author of",
            "summary of book", "facts about", "definition of"
        )
        return searchKeywords.any { q.contains(it) }
    }

    /**
     * Executes privacy-preserving online query.
     */
    suspend fun searchWeb(query: String): WebSearchResult = withContext(Dispatchers.IO) {
        val cleanQuery = query
            .replace(Regex("(?i)search for|search the web for|lookup|who is|what is the latest on"), "")
            .trim()

        if (cleanQuery.isBlank()) {
            return@withContext WebSearchResult.Error("Search query is empty.")
        }

        var connection: HttpURLConnection? = null
        try {
            val encoded = URLEncoder.encode(cleanQuery, "UTF-8")
            val endpointUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=$encoded&utf8=&format=json&srlimit=$MAX_SNIPPETS"

            val url = URL(endpointUrl)
            connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                setRequestProperty("User-Agent", "BloomQuest-Android/1.6 (SelfCareHero; Offline-First Education)")
                setRequestProperty("Accept", "application/json")
            }

            val responseCode = connection.responseCode
            if (responseCode !in 200..299) {
                return@withContext WebSearchResult.Error("Search service responded with HTTP $responseCode")
            }

            val reader = BufferedReader(InputStreamReader(connection.inputStream))
            val responseText = reader.use { it.readText() }

            val json = JSONObject(responseText)
            val queryObj = json.optJSONObject("query") ?: return@withContext WebSearchResult.Error("No search results returned.")
            val searchArr = queryObj.optJSONArray("search") ?: return@withContext WebSearchResult.Error("No items found.")

            val sources = mutableListOf<WebSearchSource>()
            for (i in 0 until minOf(searchArr.length(), MAX_SNIPPETS)) {
                val item = searchArr.getJSONObject(i)
                val title = item.optString("title", "Reference")
                val rawSnippet = item.optString("snippet", "")
                
                // Strip HTML tags (<span class="searchmatch">...</span>)
                val cleanSnippet = sanitizeUntrustedSnippet(rawSnippet)
                val pageUrl = "https://en.wikipedia.org/wiki/" + URLEncoder.encode(title.replace(" ", "_"), "UTF-8")

                if (cleanSnippet.isNotBlank()) {
                    sources.add(WebSearchSource(title = title, snippet = cleanSnippet, url = pageUrl))
                }
            }

            if (sources.isEmpty()) {
                WebSearchResult.Error("No matching search citations found.")
            } else {
                WebSearchResult.Success(sources = sources, query = cleanQuery)
            }
        } catch (e: java.net.UnknownHostException) {
            WebSearchResult.Offline("Network host unreachable. Device appears offline or in Airplane Mode.")
        } catch (e: java.net.SocketTimeoutException) {
            WebSearchResult.Offline("Connection timed out while fetching online citations.")
        } catch (e: java.io.IOException) {
            WebSearchResult.Offline("Network connection failed: ${e.localizedMessage ?: "Offline"}")
        } catch (e: Exception) {
            WebSearchResult.Error("Unexpected search error: ${e.localizedMessage ?: "Unknown"}")
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Sanitizes untrusted text retrieved from external web sources.
     * Prevents prompt injection, malicious delimiters, and excessive token usage.
     */
    fun sanitizeUntrustedSnippet(rawHtml: String): String {
        return rawHtml
            .replace(Regex("<[^>]*>"), "") // Strip HTML tags
            .replace("&quot;", "\"")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&#39;", "'")
            // Prevent prompt injection / delimiters
            .replace("<|im_start|>", "")
            .replace("<|im_end|>", "")
            .replace("system:", "")
            .replace("assistant:", "")
            .replace(Regex("\\s+"), " ")
            .trim()
            .take(MAX_SNIPPET_LENGTH)
    }
}
