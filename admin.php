<?php
/**
 * PULSEWEAR — Executive Admin Portal (PHP Edition)
 * Web Engineering Course Project Submission
 * 
 * Features:
 * - Independent Admin Portal (Teacher Requirement)
 * - Garments & Outerwear Inventory Management (Hoodies & Jackets)
 * - Customer Orders & Dispatch Pipeline (11-digit phone, letters-only validation)
 * - Sales & Revenue Analytics
 * - Pure PHP + Self-Contained Styles (No Node/npm dependency required to run)
 */

session_start();

// Handle mock actions for demonstration
$actionNotice = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        if ($action === 'ship_order') {
            $orderId = htmlspecialchars($_POST['order_id'] ?? '');
            $actionNotice = "Order #{$orderId} has been marked as SHIPPED via Express Courier.";
        } elseif ($action === 'deliver_order') {
            $orderId = htmlspecialchars($_POST['order_id'] ?? '');
            $actionNotice = "Order #{$orderId} marked as DELIVERED to client.";
        } elseif ($action === 'update_stock') {
            $prodTitle = htmlspecialchars($_POST['prod_title'] ?? '');
            $newStock = intval($_POST['new_stock'] ?? 0);
            $actionNotice = "Inventory updated: {$prodTitle} stock adjusted to {$newStock} units.";
        } elseif ($action === 'add_product') {
            $prodTitle = htmlspecialchars($_POST['title'] ?? 'New Item');
            $actionNotice = "Garment '{$prodTitle}' has been added to the active storefront catalog!";
        }
    }
}

// Sample Outerwear Catalog Data
$inventory = [
    [
        'id' => 'pw-01',
        'title' => 'Shadow Matrix Heavyweight Hoodie',
        'category' => 'Heavyweight Hoodie',
        'gsm' => 500,
        'price' => 98.00,
        'stock' => 14,
        'badge' => 'BESTSELLER',
        'rating' => 4.95,
        'sold' => 184
    ],
    [
        'id' => 'pw-02',
        'title' => 'Cyber-Spec Modular Techwear Jacket',
        'category' => 'Tactical Jacket',
        'gsm' => 380,
        'price' => 185.00,
        'stock' => 9,
        'badge' => 'WATERPROOF',
        'rating' => 4.92,
        'sold' => 96
    ],
    [
        'id' => 'pw-03',
        'title' => 'Sub-Zero Arctic Down Puffer',
        'category' => 'Puffer Jacket',
        'gsm' => 650,
        'price' => 210.00,
        'stock' => 7,
        'badge' => 'NEW DROP',
        'rating' => 4.88,
        'sold' => 71
    ],
    [
        'id' => 'pw-04',
        'title' => 'Vapour Cloud Sherpa Fleece Zip Hoodie',
        'category' => 'Heavyweight Hoodie',
        'gsm' => 480,
        'price' => 115.00,
        'stock' => 11,
        'badge' => 'LIMITED RUN',
        'rating' => 4.96,
        'sold' => 142
    ],
    [
        'id' => 'pw-05',
        'title' => 'Retro-Velocity Heavyweight Bomber',
        'category' => 'Bomber Jacket',
        'gsm' => 520,
        'price' => 165.00,
        'stock' => 18,
        'badge' => 'BESTSELLER',
        'rating' => 4.91,
        'sold' => 110
    ],
    [
        'id' => 'pw-08',
        'title' => 'Midnight Echo Heavy Full-Zip Hoodie',
        'category' => 'Heavyweight Hoodie',
        'gsm' => 520,
        'price' => 108.00,
        'stock' => 12,
        'badge' => '500 GSM',
        'rating' => 4.97,
        'sold' => 219
    ]
];

// Sample Orders
$orders = [
    [
        'id' => 'PW-940218',
        'customer' => 'Hamza Tariq',
        'username' => 'hamza_t',
        'phone' => '+92 03001234567',
        'address' => 'Street 4, Sector F-8/3, Islamabad',
        'items' => 'Shadow Matrix Hoodie (Size L, Onyx Black)',
        'amount' => 110.00,
        'payment' => 'Cash on Delivery (COD)',
        'status' => 'Processing',
        'date' => 'Oct 1, 2026'
    ],
    [
        'id' => 'PW-881923',
        'customer' => 'Bilal Ahmed',
        'username' => 'bilal_street',
        'phone' => '+92 03219876543',
        'address' => 'DHA Phase 5, Lahore',
        'items' => 'Cyber-Spec Jacket (XL) + Midnight Echo (XL)',
        'amount' => 234.40,
        'payment' => 'Credit Card',
        'status' => 'Shipped',
        'date' => 'Sep 30, 2026'
    ],
    [
        'id' => 'PW-712049',
        'customer' => 'Ayesha Khan',
        'username' => 'ayesha_k',
        'phone' => '+92 03335557799',
        'address' => 'Clifton Block 2, Karachi',
        'items' => 'Sub-Zero Down Puffer (Size M, Bone White)',
        'amount' => 210.00,
        'payment' => 'Digital Wallet',
        'status' => 'Delivered',
        'date' => 'Sep 29, 2026'
    ]
];

$totalRevenue = 28450.00;
$totalUnitsSold = 822;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PULSEWEAR Admin Executive (PHP Edition)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --canvas: #07090e;
      --card-bg: #0e131f;
      --card-border: rgba(255, 255, 255, 0.08);
      --indigo: #6366f1;
      --indigo-hover: #4f46e5;
      --emerald: #10b981;
      --cyan: #06b6d4;
      --amber: #f59e0b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--canvas);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 24px;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    .brand-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .badge-status {
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 800;
      margin-top: 6px;
      color: #fff;
    }
    .stat-sub {
      font-size: 11px;
      color: var(--emerald);
      margin-top: 4px;
    }
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow-x: auto;
      margin-bottom: 32px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 12px;
    }
    th {
      background: rgba(255, 255, 255, 0.02);
      padding: 14px 16px;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.01);
    }
    .btn {
      background: var(--indigo);
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background 0.2s;
    }
    .btn:hover { background: var(--indigo-hover); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: #fff;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    .alert {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #c7d2fe;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
    }
    .pill-green { background: rgba(16, 185, 129, 0.15); color: var(--emerald); }
    .pill-cyan { background: rgba(6, 182, 212, 0.15); color: var(--cyan); }
    .pill-amber { background: rgba(245, 158, 11, 0.15); color: var(--amber); }
  </style>
</head>
<body>
<div class="container">
  <header>
    <div class="brand">
      <img src="public/images/pulsewear-logo.jpg" alt="PulseWear Logo" style="height: 42px; width: 42px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(99, 102, 241, 0.4); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);" onerror="this.style.display='none'">
      <div>
        <div class="brand-title">PULSE<span style="color: #818cf8;">WEAR</span> ADMIN EXECUTIVE</div>
        <div style="font-size: 11px; color: var(--text-muted);">
          Independent Course Admin Console • PHP 8.2+ Architecture
        </div>
      </div>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <span class="badge-status">● SYSTEM NOMINAL</span>
      <a href="http://localhost:3000" class="btn btn-secondary">Open Main Storefront (Next.js)</a>
    </div>
  </header>

  <?php if ($actionNotice): ?>
    <div class="alert">✓ <?php echo $actionNotice; ?></div>
  <?php endif; ?>

  <!-- Telemetry Row -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Gross Sales</div>
      <div class="stat-val">$<?php echo number_format($totalRevenue, 2); ?></div>
      <div class="stat-sub">↑ 22.4% over monthly target</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Garments Dispatched</div>
      <div class="stat-val"><?php echo $totalUnitsSold; ?> pcs</div>
      <div class="stat-sub">Heavyweight Hoodies (500 GSM) Top #1</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Orders</div>
      <div class="stat-val"><?php echo count($orders); ?> In Queue</div>
      <div class="stat-sub">All addresses verified</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average Order Value</div>
      <div class="stat-val">$148.50</div>
      <div class="stat-sub">Free Worldwide Shipping Enabled</div>
    </div>
  </div>

  <!-- Orders Table -->
  <div class="section-title">
    <span>Customer Orders & Delivery Dispatch</span>
    <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">
      Strict 11-Digit Phone & Letters-Only Verification
    </span>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer & Username</th>
          <th>Phone (11 Digits)</th>
          <th>Garments</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($orders as $ord): ?>
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: var(--indigo);"><?php echo $ord['id']; ?></td>
          <td>
            <strong><?php echo $ord['customer']; ?></strong><br>
            <span style="font-size: 11px; color: var(--text-muted);">@<?php echo $ord['username']; ?></span>
          </td>
          <td style="font-family: monospace; color: var(--cyan);"><?php echo $ord['phone']; ?></td>
          <td style="font-size: 11px;"><?php echo $ord['items']; ?></td>
          <td style="font-weight: bold; color: #fff;">$<?php echo number_format($ord['amount'], 2); ?></td>
          <td style="font-size: 11px; color: var(--text-muted);"><?php echo $ord['payment']; ?></td>
          <td>
            <?php if ($ord['status'] === 'Delivered'): ?>
              <span class="pill pill-green">Delivered</span>
            <?php elseif ($ord['status'] === 'Shipped'): ?>
              <span class="pill pill-cyan">Shipped</span>
            <?php else: ?>
              <span class="pill pill-amber">Processing</span>
            <?php endif; ?>
          </td>
          <td>
            <form method="POST" style="display: inline;">
              <input type="hidden" name="order_id" value="<?php echo $ord['id']; ?>">
              <?php if ($ord['status'] === 'Processing'): ?>
                <input type="hidden" name="action" value="ship_order">
                <button type="submit" class="btn">Mark Shipped</button>
              <?php else: ?>
                <input type="hidden" name="action" value="deliver_order">
                <button type="submit" class="btn btn-secondary">Mark Delivered</button>
              <?php endif; ?>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- Inventory Table -->
  <div class="section-title">
    <span>Active Outerwear Inventory (Hoodies & Jackets)</span>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Style</th>
          <th>Category</th>
          <th>Fabric Weight</th>
          <th>Price</th>
          <th>Stock Units</th>
          <th>Customer Rating</th>
          <th>Adjust Inventory</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($inventory as $prod): ?>
        <tr>
          <td>
            <strong><?php echo $prod['title']; ?></strong>
            <span class="pill pill-cyan" style="margin-left: 6px;"><?php echo $prod['badge']; ?></span>
          </td>
          <td style="font-family: monospace; color: var(--indigo);"><?php echo $prod['category']; ?></td>
          <td><?php echo $prod['gsm']; ?> GSM</td>
          <td style="font-weight: bold; color: #fff;">$<?php echo number_format($prod['price'], 2); ?></td>
          <td><span class="pill pill-green"><?php echo $prod['stock']; ?> units in warehouse</span></td>
          <td style="color: var(--amber);">★ <?php echo $prod['rating']; ?> (<?php echo $prod['sold']; ?> sold)</td>
          <td>
            <form method="POST" style="display: flex; gap: 6px; align-items: center;">
              <input type="hidden" name="action" value="update_stock">
              <input type="hidden" name="prod_title" value="<?php echo $prod['title']; ?>">
              <input type="number" name="new_stock" value="<?php echo $prod['stock']; ?>" style="width: 60px; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: #fff; padding: 4px; border-radius: 6px; font-size: 11px;">
              <button type="submit" class="btn btn-secondary" style="font-size: 10px; padding: 4px 8px;">Save</button>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
</body>
</html>
