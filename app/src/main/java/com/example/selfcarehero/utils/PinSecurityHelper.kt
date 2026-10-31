package com.example.selfcarehero.utils

import java.security.MessageDigest

object PinSecurityHelper {
    private const val SALT = "BloomQuest_Offline_Privacy_Salt_v1"

    /**
     * Computes a salted SHA-256 hash of a 4-digit PIN.
     */
    fun hashPin(pin: String): String {
        val input = "$SALT:$pin"
        val digest = MessageDigest.getInstance("SHA-256")
        val bytes = digest.digest(input.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }

    /**
     * Validates input PIN against stored hash.
     */
    fun verifyPin(inputPin: String, storedHash: String): Boolean {
        if (storedHash.isBlank() || inputPin.length != 4) return false
        val computed = hashPin(inputPin)
        return computed.equals(storedHash, ignoreCase = true)
    }
}
