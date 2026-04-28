#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CMA Member Engagement Platform — Codespace Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Install npm dependencies
echo "▶ [1/4] Installing npm dependencies..."
npm install
echo "✓ npm dependencies installed"
echo ""

# Step 2: Install Supabase CLI globally
echo "▶ [2/4] Installing Supabase CLI globally..."
npm install -g supabase
echo "✓ Supabase CLI installed"
echo ""

# Step 3: Copy .env.local.example → .env.local (never overwrite)
echo "▶ [3/4] Setting up environment file..."
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "✓ .env.local created from .env.local.example"
else
  echo "✓ .env.local already exists — skipping copy"
fi
echo ""

# Step 4: Done
echo "▶ [4/4] Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CMA Engagement Platform — Codespace ready! 🙏"
echo ""
echo "  Next steps:"
echo "  1. Open .env.local and fill in your API keys"
echo "     (NEXT_PUBLIC_ZEFFY_FORM_ID is optional — Simulate button works without it)"
echo "  2. Run: npm run db:migrate   # runs all 3 migrations incl. 003_zeffy_portal"
echo "  3. Run: npm run db:seed"
echo "  4. Run: npm run dev"
echo ""
echo "  Portal Demo routes (Session 3):"
echo "    /portal/registration  — member selector + Zeffy iframe + Simulate button"
echo "    /portal/dashboard     — live polling table with Reset All"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
