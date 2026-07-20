/**
 * Lua script to securely rotate a refresh token in a Redis-based session management system.
 *
 * The script performs the following steps:
 * 1. Validates the existence of the session data associated with the provided session key.
 * 2. Decodes the session JSON data and verifies that:
 *    - The `refreshTokenHash` matches the passed current refresh token hash.
 *    - The `refreshExpiresAt` timestamp has not yet expired.
 *    - The refresh token being replaced matches the one provided in a secondary key.
 * 3. Updates the session with a new refresh token hash and updates the session's `lastActiveAt` timestamp.
 * 4. Refreshes the expiration of the session and related Redis keys.
 * 5. Removes the secondary key associated with the previous refresh token and updates it to use the new token.
 *
 * KEYS:
 * - KEYS[1]: Primary Redis key for the session data.
 * - KEYS[2]: Secondary Redis key holding the current refresh token.
 * - KEYS[3]: Redis key to store the refresh token for the new session.
 * - KEYS[4]: Redis key for updating additional metadata related to the new refresh token.
 *
 * ARGV:
 * - ARGV[1]: Current hashed refresh token from the session.
 * - ARGV[2]: New hashed refresh token to replace the current one.
 * - ARGV[3]: Identifier of the new refresh token.
 * - ARGV[4]: Timestamp indicating the last active time for the session.
 * - ARGV[5]: Current timestamp to validate session expiration.
 * - ARGV[6]: New expiration time (in seconds) to set for the refresh token and session data.
 *
 * @constant {string} ROTATE_REFRESH_TOKEN_SCRIPT - Lua script for securely rotating refresh tokens.
 */
export const ROTATE_REFRESH_TOKEN_SCRIPT = `
local sessionJson = redis.call('GET', KEYS[1])
if not sessionJson then return 0 end

local session = cjson.decode(sessionJson)
if session.refreshTokenHash ~= ARGV[1] then return 0 end
if session.refreshExpiresAt <= ARGV[5] then return 0 end
if redis.call('GET', KEYS[2]) ~= ARGV[3] then return 0 end

session.refreshTokenHash = ARGV[2]
session.lastActiveAt = ARGV[4]

redis.call('SET', KEYS[3], ARGV[3], 'EX', ARGV[6])
redis.call('DEL', KEYS[2])
redis.call('SET', KEYS[1], cjson.encode(session), 'EX', ARGV[6])
redis.call('SET', KEYS[4], ARGV[3], 'EX', ARGV[6])

return 1
`;
