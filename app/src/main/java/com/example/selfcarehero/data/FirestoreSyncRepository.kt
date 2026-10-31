package com.example.selfcarehero.data

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.example.selfcarehero.R
import com.example.selfcarehero.model.*
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential.Companion.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Cloud Sync Repository using Firebase Firestore and Google Sign-In via Credential Manager.
 * Syncs user progression, habits, reflections, and streak records to /users/{userId}/
 * using the custom provisioned database ID.
 */
class FirestoreSyncRepository(
    private val context: Context,
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance(
        context.applicationContext.getString(R.string.firestore_database_id)
    )
) {
    private val auth: FirebaseAuth = Firebase.auth
    private val credentialManager = CredentialManager.create(context)

    private val _currentUser = MutableStateFlow<FirebaseUser?>(auth.currentUser)
    val currentUser: StateFlow<FirebaseUser?> = _currentUser.asStateFlow()

    private val _syncStatus = MutableStateFlow<String>("Offline / Local")
    val syncStatus: StateFlow<String> = _syncStatus.asStateFlow()

    private val _isSyncing = MutableStateFlow<Boolean>(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    init {
        auth.addAuthStateListener { firebaseAuth ->
            _currentUser.value = firebaseAuth.currentUser
            _syncStatus.value = if (firebaseAuth.currentUser != null) {
                "Synced (${firebaseAuth.currentUser?.displayName ?: "Google User"})"
            } else {
                "Local Only (Sign in to sync)"
            }
        }
    }

    fun isUserSignedIn(): Boolean = auth.currentUser != null

    fun getUserId(): String? = auth.currentUser?.uid

    private fun requireUserId(): String {
        return auth.currentUser?.uid
            ?: throw IllegalStateException("User must be signed in with Google before accessing Firestore.")
    }

    /**
     * Interactive Google Sign-In using Jetpack CredentialManager
     */
    fun signInWithGoogle(
        activity: Activity,
        scope: CoroutineScope,
        onSuccess: (FirebaseUser) -> Unit,
        onError: (String) -> Unit
    ) {
        val clientId = try {
            activity.getString(R.string.default_web_client_id)
        } catch (e: Exception) {
            onError("Google Sign-In configuration missing: default_web_client_id")
            return
        }

        val signInOption = GetSignInWithGoogleOption.Builder(serverClientId = clientId).build()
        val request = GetCredentialRequest.Builder().addCredentialOption(signInOption).build()

        scope.launch {
            try {
                val result = credentialManager.getCredential(activity, request)
                val credential = result.credential
                if (credential is CustomCredential && credential.type == TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data).idToken
                    val authCredential = GoogleAuthProvider.getCredential(googleIdToken, null)
                    val authResult = auth.signInWithCredential(authCredential).await()
                    val user = authResult.user
                    if (user != null) {
                        _currentUser.value = user
                        _syncStatus.value = "Synced as ${user.displayName ?: user.email}"
                        onSuccess(user)
                    } else {
                        onError("Firebase user session could not be established")
                    }
                } else {
                    onError("Unexpected credential format received")
                }
            } catch (e: GetCredentialCancellationException) {
                Log.w("Auth", "Google Sign-In flow cancelled: ${e.message}")
            } catch (e: Exception) {
                Log.e("Auth", "Google Sign-In failed", e)
                onError(e.localizedMessage ?: "Google Sign-In failed")
            }
        }
    }

    /**
     * Sign out of Firebase and clear Android Credential Manager session
     */
    fun signOut(scope: CoroutineScope, onComplete: () -> Unit) {
        auth.signOut()
        _currentUser.value = null
        _syncStatus.value = "Local Only (Sign in to sync)"
        scope.launch {
            try {
                credentialManager.clearCredentialState(ClearCredentialStateRequest())
            } catch (e: Exception) {
                Log.e("Auth", "Failed to clear credential state", e)
            } finally {
                onComplete()
            }
        }
    }

    /**
     * Upload user's complete Self-Care Hero profile, habits, and journals to Firestore
     */
    suspend fun uploadToCloud(state: AppState): Boolean {
        val uid = getUserId() ?: return false
        _isSyncing.value = true
        _syncStatus.value = "Syncing..."
        return try {
            val userDocRef = db.collection("users").document(uid)

            val profilePayload = mapOf(
                "userId" to uid,
                "level" to (Math.floor(Math.sqrt(Math.max(0, state.ev.sumOf { it.x }) / 50.0)).toInt() + 1),
                "coins" to state.coins,
                "totalXp" to (state.ev.sumOf { it.x } + state.dailyThreeStreak.cur * 30),
                "streakCur" to state.dailyThreeStreak.cur,
                "streakBest" to state.dailyThreeStreak.best,
                "streakLastDate" to state.dailyThreeStreak.lastCompletedDate,
                "restDayTokens" to state.restDayTokens,
                "lastSync" to FieldValue.serverTimestamp()
            )

            // Save user profile
            userDocRef.set(profilePayload, SetOptions.merge()).await()

            // Save recent journal entries
            val journalBatch = db.batch()
            for (entry in state.jr.take(20)) {
                val doc = userDocRef.collection("journal").document(entry.id)
                val jData = mapOf(
                    "id" to entry.id,
                    "userId" to uid,
                    "d" to entry.d,
                    "m" to entry.m,
                    "t" to entry.t,
                    "tags" to entry.g,
                    "createdAt" to FieldValue.serverTimestamp()
                )
                journalBatch.set(doc, jData, SetOptions.merge())
            }

            // Save user custom nodes
            val nodeBatch = db.batch()
            for (node in state.nodes) {
                val doc = userDocRef.collection("nodes").document(node.id)
                val nData = mapOf(
                    "id" to node.id,
                    "userId" to uid,
                    "p" to node.p,
                    "e" to node.e,
                    "n" to node.n,
                    "k" to node.k,
                    "g" to node.g,
                    "u" to node.u,
                    "nature" to node.nature,
                    "importance" to node.importance,
                    "routineTime" to (node.routineTime ?: "anytime"),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                nodeBatch.set(doc, nData, SetOptions.merge())
            }

            journalBatch.commit().await()
            nodeBatch.commit().await()

            _syncStatus.value = "Cloud Backup Active ✓"
            _isSyncing.value = false
            true
        } catch (e: Exception) {
            Log.e("FirestoreSync", "Failed to sync to cloud", e)
            _syncStatus.value = "Sync error: ${e.localizedMessage ?: "Network issue"}"
            _isSyncing.value = false
            false
        }
    }
}
