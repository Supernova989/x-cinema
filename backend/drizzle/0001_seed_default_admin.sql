INSERT INTO "users" ("email",
                     "password_hash",
                     "first_name",
                     "last_name",
                     "active",
                     "role")

VALUES ('admin@example.com',
        '$argon2id$v=19$m=19456,t=2,p=1$v7VLb9iKAcVuXVk1YNVwcQ$dyDYQFnhJRZWhH9M9ZWtGq88xyPJLruQBrHvzJGw7PY',
        'Admin',
        'User',
        true,
        'admin')

ON CONFLICT ("email") DO NOTHING;