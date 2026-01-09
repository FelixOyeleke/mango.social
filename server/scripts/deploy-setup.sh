#!/bin/bash

# Deployment setup script for Render
# This script runs database migrations and seeds

echo "🚀 Starting deployment setup..."
echo ""

# Run migrations
echo "📊 Running database migrations..."
npm run db:migrate

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations completed successfully"
echo ""

# Run image migration
echo "🖼️  Running image migration..."
npm run db:migrate:images

if [ $? -ne 0 ]; then
    echo "⚠️  Image migration failed (may already exist)"
fi

echo ""

# Run jobs migration
echo "💼 Running jobs migration..."
npm run db:migrate:jobs

if [ $? -ne 0 ]; then
    echo "⚠️  Jobs migration failed (may already exist)"
fi

echo ""

# Run messaging migration
echo "💬 Running messaging migration..."
npm run db:migrate:messaging

if [ $? -ne 0 ]; then
    echo "⚠️  Messaging migration failed (may already exist)"
fi

echo ""

# Run features migration
echo "✨ Running features migration..."
npm run db:migrate:features

if [ $? -ne 0 ]; then
    echo "⚠️  Features migration failed (may already exist)"
fi

echo ""

# Run username migration
echo "👤 Running username migration..."
npm run db:migrate:username

if [ $? -ne 0 ]; then
    echo "⚠️  Username migration failed (may already exist)"
fi

echo ""

# Run banner migration
echo "🎨 Running banner migration..."
npm run db:migrate:banner

if [ $? -ne 0 ]; then
    echo "⚠️  Banner migration failed (may already exist)"
fi

echo ""

# Seed database (only if SEED_DATABASE env var is set)
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Seeding failed"
    else
        echo "✅ Database seeded successfully"
    fi
    echo ""
fi

# Create admin user (only if CREATE_ADMIN env var is set)
if [ "$CREATE_ADMIN" = "true" ]; then
    echo "👑 Creating admin user..."
    npm run db:create-admin
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Admin creation failed (may already exist)"
    else
        echo "✅ Admin user created successfully"
    fi
    echo ""
fi

echo "✅ Deployment setup completed!"
echo ""
echo "🎉 Your application is ready to use!"

