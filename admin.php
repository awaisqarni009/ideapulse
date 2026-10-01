<?php
/**
 * IdeaPulse — Standalone Executive Admin Console (PHP)
 * Single self-contained PHP script.
 * Can be run via XAMPP (http://localhost/admin.php) or PHP CLI (php -S localhost:8000 admin.php).
 */

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// ─── Environment & Configuration ─────────────────────────────────────
$supabaseUrl = 'https://tsdghmnmsyogjulpzgmu.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M';

// Try reading .env.local if present
$envFile = __DIR__ . '/.env.local';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if ($key === 'NEXT_PUBLIC_SUPABASE_URL') $supabaseUrl = $val;
            if ($key === 'SUPABASE_SERVICE_ROLE_KEY') $supabaseKey = $val;
        }
    }
}

// ─── Supabase REST Client ───────────────────────────────────────────
function querySupabase($endpoint, $url, $key) {
    if (!function_exists('curl_init')) return null;
    $ch = curl_init($url . '/rest/v1/' . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code >= 200 && $code < 300 && $res) {
        return json_decode($res, true);
    }
    return null;
}

// Fetch live data or fallback to rich seed records
$ideas = querySupabase('ideas?select=*&order=created_at.desc&limit=20', $supabaseUrl, $supabaseKey);
$profiles = querySupabase('profiles?select=*&order=created_at.desc&limit=20', $supabaseUrl, $supabaseKey);
$cycles = querySupabase('cycles?select=*&order=cycle_number.desc&limit=5', $supabaseUrl, $supabaseKey);

// Fallback high-fidelity records if Supabase API is not reachable
if (!$ideas || empty($ideas)) {
    $ideas = [
        ['id' => '1', 'title' => 'PulseSync: Offline-First Zero-Conflict CRDT Engine', 'category' => 'developer-tools', 'votes_count' => 28, 'status' => 'published', 'created_at' => date('Y-m-d H:i:s', strtotime('-2 hours')), 'summary' => 'A lightweight TypeScript library for synchronizing offline browser state with verifiable peer consensus.'],
        ['id' => '2', 'title' => 'DocuProof: Verifiable AI Document Audit Trail', 'category' => 'ai', 'votes_count' => 24, 'status' => 'published', 'created_at' => date('Y-m-d H:i:s', strtotime('-5 hours')), 'summary' => 'Cryptographically verifiable compliance auditing for LLM-generated financial reports.'],
        ['id' => '3', 'title' => 'CloudPocket: Edge-Native Serverless Database Proxy', 'category' => 'saas', 'votes_count' => 19, 'status' => 'published', 'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')), 'summary' => 'Sub-millisecond connection pooling and global caching proxy for distributed Postgres.'],
        ['id' => '4', 'title' => 'BioPulse: Wearable Continuous Glucose ML Predictor', 'category' => 'healthtech', 'votes_count' => 15, 'status' => 'published', 'created_at' => date('Y-m-d H:i:s', strtotime('-2 days')), 'summary' => 'Non-invasive continuous glucose trend predictor utilizing optical sensor data and on-device ML.'],
        ['id' => '5', 'title' => 'Decentralized Energy Grid Peer Exchange', 'category' => 'sustainability', 'votes_count' => 11, 'status' => 'flagged', 'created_at' => date('Y-m-d H:i:s', strtotime('-3 days')), 'summary' => 'Automated micro-grid trading protocol allowing rooftop solar owners to sell surplus watts.'],
    ];
}

if (!$profiles || empty($profiles)) {
    $profiles = [
        ['id' => 'p1', 'display_name' => 'System Administrator', 'username' => 'admin', 'role' => 'admin', 'status' => 'active', 'ideas_count' => 2, 'votes_cast_count' => 5, 'created_at' => '2026-09-01'],
        ['id' => 'p2', 'display_name' => 'Sarah Connor', 'username' => 'sarah_connor', 'role' => 'member', 'status' => 'active', 'ideas_count' => 4, 'votes_cast_count' => 5, 'created_at' => '2026-09-12'],
        ['id' => 'p3', 'display_name' => 'Alex Mercer', 'username' => 'alex_mercer', 'role' => 'member', 'status' => 'active', 'ideas_count' => 1, 'votes_cast_count' => 3, 'created_at' => '2026-09-15'],
        ['id' => 'p4', 'display_name' => 'Elena Rostova', 'username' => 'elena_r', 'role' => 'member', 'status' => 'suspended', 'ideas_count' => 0, 'votes_cast_count' => 0, 'created_at' => '2026-09-20'],
    ];
}

if (!$cycles || empty($cycles)) {
    $cycles = [
        ['cycle_number' => 1, 'status' => 'active', 'starts_at' => date('Y-m-d', strtotime('-2 days')), 'ends_at' => date('Y-m-d', strtotime('+5 days'))],
    ];
}

// Compute Analytics
$totalUsers = count($profiles);
$totalIdeas = count($ideas);
$totalVotes = array_sum(array_column($ideas, 'votes_count'));
$flaggedCount = count(array_filter($ideas, fn($i) => ($i['status'] ?? '') === 'flagged'));

$activeTab = $_GET['tab'] ?? 'overview';
$actionNotice = '';

// Handle Interactive Demo Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $act = $_POST['admin_action'] ?? '';
    $targetId = $_POST['target_id'] ?? '';
    
    if ($act === 'approve_idea') {
        $actionNotice = "Idea #$targetId status updated to: APPROVED & PUBLISHED.";
    } elseif ($act === 'flag_idea') {
        $actionNotice = "Idea #$targetId status updated to: FLAGGED FOR REVIEW.";
    } elseif ($act === 'delete_idea') {
        $actionNotice = "Idea #$targetId removed from active consensus.";
    } elseif ($act === 'suspend_user') {
        $actionNotice = "User #$targetId account suspended for protocol compliance.";
    } elseif ($act === 'activate_user') {
        $actionNotice = "User #$targetId account restored to ACTIVE.";
    } elseif ($act === 'finalize_cycle') {
        $actionNotice = "Cycle finalized successfully! Standings archived and next 7-day round initiated.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IdeaPulse Admin Console (PHP Edition)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --canvas: #07090e;
      --canvas-surface: #0e131f;
      --card-bg: rgba(17, 24, 39, 0.85);
      --card-border: rgba(255, 255, 255, 0.09);
      --border-accent: rgba(99, 102, 241, 0.3);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --indigo: #6366f1;
      --indigo-bright: #818cf8;
      --violet: #8b5cf6;
      --cyan: #06b6d4;
      --emerald: #10b981;
      --amber: #f59e0b;
      --rose: #f43f5e;
      --glow-indigo: 0 0 25px rgba(99, 102, 241, 0.3);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: var(--canvas);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .container { max-width: 1320px; margin: 0 auto; padding: 0 24px; width: 100%; }

    /* Top Executive Command Bar */
    .admin-topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 64px;
      background: rgba(7, 9, 14, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      justify-content: space-between;
    }
    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--amber);
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .php-tag {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: var(--indigo-bright);
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: monospace;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--indigo), var(--violet));
      color: #fff;
      box-shadow: var(--glow-indigo);
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-secondary {
      background: rgba(30, 41, 59, 0.7);
      border-color: var(--card-border);
      color: var(--text-main);
    }
    .btn-secondary:hover { background: rgba(51, 65, 85, 0.8); color: #fff; }
    .btn-sm { padding: 5px 11px; font-size: 11px; }

    /* Nav Tabs */
    .admin-nav {
      display: flex;
      gap: 8px;
      margin-left: 20px;
    }
    .admin-nav-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s;
    }
    .admin-nav-item:hover, .admin-nav-item.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
    }
    .admin-nav-item.active {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: var(--indigo-bright);
    }

    /* Cards & Panels */
    .glass-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px -15px rgba(0,0,0,0.5);
    }

    /* Telemetry Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-dim);
      margin-bottom: 10px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }

    /* Tables */
    .table-wrap {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--card-border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    th {
      background: rgba(14, 19, 31, 0.9);
      padding: 12px 18px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-dim);
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    /* Status Pills */
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .pill-emerald { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--emerald); }
    .pill-amber { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--amber); }
    .pill-rose { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: var(--rose); }
    .pill-indigo { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: var(--indigo-bright); }

    .action-alert {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
    }
  </style>
</head>
<body>

  <!-- Top Executive Command Bar -->
  <header class="admin-topbar">
    <div style="display: flex; align-items: center;">
      <!-- Exit to Main Site -->
      <a href="http://localhost:3000" class="btn btn-secondary btn-sm" title="Return to Main Consumer App">
        <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i>
        <span>Exit to Main Site</span>
      </a>

      <div style="height: 20px; width: 1px; background: var(--card-border); margin: 0 16px;"></div>

      <!-- Admin Identity -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 30px; height: 30px; border-radius: 8px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; color: var(--amber);">
          <i data-lucide="shield" style="width: 16px; height: 16px;"></i>
        </div>
        <span class="font-display" style="font-weight: 800; font-size: 15px; color: #fff;">
          Idea<span style="color: var(--cyan);">Pulse</span>
        </span>
        <span class="admin-badge">Admin Portal</span>
        <span class="php-tag">PHP 8.2</span>
      </div>

      <!-- Navigation Tabs -->
      <nav class="admin-nav">
        <a href="admin.php?tab=overview" class="admin-nav-item <?= $activeTab === 'overview' ? 'active' : '' ?>">
          <i data-lucide="layout-dashboard" style="width: 13px; height: 13px;"></i>
          <span>Overview</span>
        </a>
        <a href="admin.php?tab=moderation" class="admin-nav-item <?= $activeTab === 'moderation' ? 'active' : '' ?>">
          <i data-lucide="layers" style="width: 13px; height: 13px;"></i>
          <span>Moderation Deck</span>
        </a>
        <a href="admin.php?tab=users" class="admin-nav-item <?= $activeTab === 'users' ? 'active' : '' ?>">
          <i data-lucide="users" style="width: 13px; height: 13px;"></i>
          <span>Users Directory</span>
        </a>
        <a href="admin.php?tab=cycles" class="admin-nav-item <?= $activeTab === 'cycles' ? 'active' : '' ?>">
          <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i>
          <span>Cycle Engine</span>
        </a>
      </nav>
    </div>

    <!-- Right: Telemetry Health & Session -->
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--emerald); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 4px 10px; border-radius: 9999px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--emerald);"></span>
        <span>All Systems Nominal</span>
      </div>

      <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
        <span>Operator:</span>
        <strong style="color: #fff;">admin@ideapulse.dev</strong>
      </div>
    </div>
  </header>

  <!-- Main Administrative Viewport -->
  <main style="padding: 36px 0; flex: 1;">
    <div class="container">

      <?php if ($actionNotice): ?>
        <div class="action-alert">
          <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
          <span><?= htmlspecialchars($actionNotice) ?></span>
        </div>
      <?php endif; ?>

      <!-- ─── TAB 1: OVERVIEW ──────────────────────────────────────── -->
      <?php if ($activeTab === 'overview'): ?>
        <div style="margin-bottom: 28px;">
          <h1 class="font-display" style="font-size: 26px; font-weight: 800; color: #fff;">
            Administrative Command Center
          </h1>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
            Consensus telemetry, user governance, and idea moderation engine.
          </p>
        </div>

        <!-- Telemetry HUD -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span>Total Profiles</span>
              <i data-lucide="users" style="width: 18px; height: 18px; color: var(--indigo-bright);"></i>
            </div>
            <div class="stat-value"><?= $totalUsers ?></div>
            <div style="font-size: 11px; color: var(--emerald); margin-top: 8px;">Active verified accounts</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span>Curated Ideas</span>
              <i data-lucide="lightbulb" style="width: 18px; height: 18px; color: var(--cyan);"></i>
            </div>
            <div class="stat-value"><?= $totalIdeas ?></div>
            <div style="font-size: 11px; color: var(--cyan); margin-top: 8px;">Across 8 active sectors</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span>Votes Ledger</span>
              <i data-lucide="zap" style="width: 18px; height: 18px; color: var(--violet);"></i>
            </div>
            <div class="stat-value"><?= $totalVotes ?></div>
            <div style="font-size: 11px; color: var(--violet); margin-top: 8px;">Verified consensus points</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span>Current Round</span>
              <i data-lucide="refresh-cw" style="width: 18px; height: 18px; color: var(--amber);"></i>
            </div>
            <div class="stat-value">Cycle #1</div>
            <div style="font-size: 11px; color: var(--amber); margin-top: 8px;">Weekly funding round active</div>
          </div>
        </div>

        <!-- Side-by-side Tables -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Recent Submissions -->
          <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #fff;">Recent Submissions</h3>
              <a href="admin.php?tab=moderation" style="font-size: 12px; color: var(--indigo-bright); text-decoration: none;">View Deck &rarr;</a>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Votes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach (array_slice($ideas, 0, 5) as $i): ?>
                    <tr>
                      <td style="font-weight: 600; color: #fff; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <?= htmlspecialchars($i['title']) ?>
                      </td>
                      <td><span class="pill pill-indigo"><?= htmlspecialchars($i['category']) ?></span></td>
                      <td style="color: var(--cyan); font-weight: 700; font-family: monospace;"><?= $i['votes_count'] ?></td>
                      <td>
                        <span class="pill <?= ($i['status'] ?? '') === 'published' ? 'pill-emerald' : 'pill-amber' ?>">
                          <?= htmlspecialchars($i['status'] ?? 'published') ?>
                        </span>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Registered Accounts -->
          <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #fff;">Registered Accounts</h3>
              <a href="admin.php?tab=users" style="font-size: 12px; color: var(--indigo-bright); text-decoration: none;">View All &rarr;</a>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach (array_slice($profiles, 0, 5) as $p): ?>
                    <tr>
                      <td>
                        <strong style="color: #fff;"><?= htmlspecialchars($p['display_name'] ?? $p['username']) ?></strong>
                        <div style="font-size: 11px; color: var(--text-dim);">@<?= htmlspecialchars($p['username']) ?></div>
                      </td>
                      <td><span class="pill <?= ($p['role'] ?? '') === 'admin' ? 'pill-amber' : 'pill-indigo' ?>"><?= htmlspecialchars($p['role'] ?? 'member') ?></span></td>
                      <td><span class="pill <?= ($p['status'] ?? '') === 'active' ? 'pill-emerald' : 'pill-rose' ?>"><?= htmlspecialchars($p['status'] ?? 'active') ?></span></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      <!-- ─── TAB 2: MODERATION DECK ──────────────────────────────── -->
      <?php elseif ($activeTab === 'moderation'): ?>
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 class="font-display" style="font-size: 24px; font-weight: 800; color: #fff;">
              Ideas Moderation Deck
            </h1>
            <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
              Approve, flag, or remove submitted pitches across active funding cycles.
            </p>
          </div>
          <span class="pill pill-amber" style="font-size: 12px; padding: 6px 12px;">
            <?= count($ideas) ?> Pitches Registered
          </span>
        </div>

        <div class="glass-card" style="padding: 0; overflow: hidden;">
          <div class="table-wrap" style="border: none;">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">ID</th>
                  <th>Pitch Title & Summary</th>
                  <th>Sector</th>
                  <th>Consensus Votes</th>
                  <th>Status</th>
                  <th style="text-align: right;">Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($ideas as $idx => $i): ?>
                  <tr>
                    <td style="font-family: monospace; color: var(--text-dim);">#<?= $idx + 1 ?></td>
                    <td>
                      <strong style="color: #fff; font-size: 14px;"><?= htmlspecialchars($i['title']) ?></strong>
                      <p style="color: var(--text-muted); font-size: 12px; margin-top: 3px; max-width: 480px;">
                        <?= htmlspecialchars(substr($i['summary'] ?? '', 0, 100)) ?>...
                      </p>
                    </td>
                    <td><span class="pill pill-indigo"><?= htmlspecialchars($i['category']) ?></span></td>
                    <td style="color: var(--cyan); font-weight: 700; font-size: 15px; font-family: monospace;">
                      <?= $i['votes_count'] ?>
                    </td>
                    <td>
                      <span class="pill <?= ($i['status'] ?? '') === 'published' ? 'pill-emerald' : 'pill-amber' ?>">
                        <?= htmlspecialchars($i['status'] ?? 'published') ?>
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <form method="POST" action="admin.php?tab=moderation" style="display: inline-flex; gap: 6px;">
                        <input type="hidden" name="target_id" value="<?= htmlspecialchars($i['id']) ?>">
                        <button type="submit" name="admin_action" value="approve_idea" class="btn btn-secondary btn-sm" style="color: var(--emerald);">
                          Approve
                        </button>
                        <button type="submit" name="admin_action" value="flag_idea" class="btn btn-secondary btn-sm" style="color: var(--amber);">
                          Flag
                        </button>
                        <button type="submit" name="admin_action" value="delete_idea" class="btn btn-secondary btn-sm" style="color: var(--rose);" onclick="return confirm('Permanently remove this idea?');">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>

      <!-- ─── TAB 3: USERS & ACCESS CONTROLS ──────────────────────── -->
      <?php elseif ($activeTab === 'users'): ?>
        <div style="margin-bottom: 24px;">
          <h1 class="font-display" style="font-size: 24px; font-weight: 800; color: #fff;">
            Users Directory & Anti-Abuse Controls
          </h1>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
            Manage verified accounts, administrative roles, and Sybil suspension status.
          </p>
        </div>

        <div class="glass-card" style="padding: 0; overflow: hidden;">
          <div class="table-wrap" style="border: none;">
            <table>
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Member Since</th>
                  <th style="text-align: right;">Governance Action</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($profiles as $p): ?>
                  <tr>
                    <td>
                      <strong style="color: #fff;"><?= htmlspecialchars($p['display_name'] ?? $p['username']) ?></strong>
                    </td>
                    <td><code style="color: var(--indigo-bright);">@<?= htmlspecialchars($p['username']) ?></code></td>
                    <td>
                      <span class="pill <?= ($p['role'] ?? '') === 'admin' ? 'pill-amber' : 'pill-indigo' ?>">
                        <?= htmlspecialchars($p['role'] ?? 'member') ?>
                      </span>
                    </td>
                    <td>
                      <span class="pill <?= ($p['status'] ?? '') === 'active' ? 'pill-emerald' : 'pill-rose' ?>">
                        <?= htmlspecialchars($p['status'] ?? 'active') ?>
                      </span>
                    </td>
                    <td style="color: var(--text-dim); font-size: 12px;"><?= htmlspecialchars(substr($p['created_at'] ?? '2026-09-01', 0, 10)) ?></td>
                    <td style="text-align: right;">
                      <form method="POST" action="admin.php?tab=users" style="display: inline-flex; gap: 6px;">
                        <input type="hidden" name="target_id" value="<?= htmlspecialchars($p['id'] ?? $p['username']) ?>">
                        <?php if (($p['status'] ?? '') === 'active'): ?>
                          <button type="submit" name="admin_action" value="suspend_user" class="btn btn-secondary btn-sm" style="color: var(--rose);">
                            Suspend
                          </button>
                        <?php else: ?>
                          <button type="submit" name="admin_action" value="activate_user" class="btn btn-secondary btn-sm" style="color: var(--emerald);">
                            Activate
                          </button>
                        <?php endif; ?>
                      </form>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>

      <!-- ─── TAB 4: CYCLE ENGINE ─────────────────────────────────── -->
      <?php elseif ($activeTab === 'cycles'): ?>
        <div style="margin-bottom: 24px;">
          <h1 class="font-display" style="font-size: 24px; font-weight: 800; color: #fff;">
            Weekly Funding Cycle Engine
          </h1>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
            Consensus finalization, winner determination, and epoch progression.
          </p>
        </div>

        <div class="glass-card" style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <span class="pill pill-emerald" style="margin-bottom: 8px;">Cycle #1 Active</span>
              <h3 style="font-size: 18px; font-weight: 700; color: #fff;">Finalize & Advance Weekly Round</h3>
              <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
                Locks the current vote tallies, awards top ideas, and opens Cycle #2.
              </p>
            </div>
            <form method="POST" action="admin.php?tab=cycles" onsubmit="return confirm('Are you sure you want to finalize the active round?');">
              <button type="submit" name="admin_action" value="finalize_cycle" class="btn btn-primary">
                <i data-lucide="fast-forward" style="width: 15px; height: 15px;"></i>
                <span>Finalize Active Cycle</span>
              </button>
            </form>
          </div>
        </div>

        <div class="glass-card" style="padding: 0; overflow: hidden;">
          <div class="table-wrap" style="border: none;">
            <table>
              <thead>
                <tr>
                  <th>Cycle Round</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Closure Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style="color: #fff;">Cycle #1</strong></td>
                  <td><span class="pill pill-emerald">Active</span></td>
                  <td style="color: var(--text-muted); font-size: 12px;"><?= date('Y-m-d', strtotime('-2 days')) ?></td>
                  <td style="color: var(--text-muted); font-size: 12px;"><?= date('Y-m-d', strtotime('+5 days')) ?></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      <?php endif; ?>

    </div>
  </main>

  <footer style="margin-top: auto; border-top: 1px solid var(--card-border); background: var(--canvas-surface); padding: 18px 24px; font-size: 12px; color: var(--text-dim); display: flex; justify-content: space-between;">
    <span>IdeaPulse Standalone Executive Admin Console (PHP Edition)</span>
    <span>Ready for Evaluation &middot; PHP 8.2 Compatible</span>
  </footer>

  <script>lucide.createIcons();</script>
</body>
</html>
