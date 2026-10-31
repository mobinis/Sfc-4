package com.example.selfcarehero

import com.example.selfcarehero.model.AppState
import com.example.selfcarehero.model.SeedData
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class StateSerializationTest {

    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = false
        isLenient = true
        coerceInputValues = true
        encodeDefaults = true
    }

    @Test
    fun testInitialStateEncodesAndDecodes() {
        val initial = SeedData.createInitialState()
        val encoded = json.encodeToString(initial)
        assertNotNull(encoded)

        val decoded = json.decodeFromString<AppState>(encoded)
        assertEquals(initial.v, decoded.v)
        assertEquals(initial.nodes.size, decoded.nodes.size)
        assertEquals(initial.videoResources.size, decoded.videoResources.size)
        assertEquals(initial.bookResources.size, decoded.bookResources.size)
    }

    @Test
    fun testLenientIgnoresUnknownKeys() {
        // Simulates JSON containing extra fields from a newer or web-based export
        val jsonWithExtra = """
            {
                "v": 19,
                "nodes": [],
                "ev": [],
                "unknownFutureProperty": "some_value",
                "extraObject": { "nested": 123 }
            }
        """.trimIndent()

        val decoded = json.decodeFromString<AppState>(jsonWithExtra)
        assertEquals(19, decoded.v)
        assertEquals(0, decoded.nodes.size)
    }
}
