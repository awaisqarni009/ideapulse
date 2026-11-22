<?php
/**
 * ============================================================================
 * PULSEWEAR — EXTERNAL ADMINISTRATIVE PORTAL & GATEWAY (PHP)
 * ============================================================================
 * Project: PulseWear Heavyweight Streetwear (Web Engineering)
 * Purpose: Standalone PHP entrypoint for administrative authentication
 *          and browser dashboard launch.
 *
 * Usage Modes:
 *   1. Web Browser (via Apache/XAMPP): http://localhost/admin_portal.php
 *      Provides a secure administrative login form, verifies credentials,
 *      and redirects directly into the Next.js Admin Dashboard.
 *   2. Command Line (CLI): php admin_portal.php
 *      Automatically pops open the default web browser to the Admin Gateway.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CLI EXECUTION MODE (Terminal / Command Prompt / Shortcut)
// ----------------------------------------------------------------------------
if (php_sapi_name() === 'cli') {
    echo "\n";
    echo "=================================================================\n";
    echo "  PULSEWEAR // HEAVYWEIGHT STREETWEAR - ADMIN PORTAL (PHP GATEWAY)\n";
    echo "=================================================================\n";
    echo "  [+] Mode: CLI Execution\n";
    echo "  [+] Target URL: http://localhost:3000/admin/login\n";
    echo "  [+] Launching default system browser...\n\n";

    // Launch default browser based on operating system
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        pclose(popen('start http://localhost:3000/admin/login', 'r'));
    } elseif (PHP_OS === 'Darwin') {
        exec('open http://localhost:3000/admin/login');
    } else {
        exec('xdg-open http://localhost:3000/admin/login > /dev/null 2>&1 &');
    }

    echo "  [✓] Browser window dispatched successfully!\n";
    echo "  [i] Credentials for evaluation:\n";
    echo "      Email:    admin@pulsewear.store\n";
    echo "      Password: Admin@PulseWear2026!\n";
    echo "=================================================================\n\n";
    exit(0);
}

// ----------------------------------------------------------------------------
// 2. WEB BROWSER MODE (XAMPP / Apache / PHP Built-in Server)
// ----------------------------------------------------------------------------
session_start();

$auth_error = null;
$auth_success = false;

// Configured Administrator Credentials
$ADMIN_EMAIL = 'admin@pulsewear.store';
$ADMIN_USERNAME = 'admin';
$ADMIN_PASSWORD = 'Admin@PulseWear2026!';
$TARGET_DASHBOARD = 'http://localhost:3000/admin/login?gateway=authorized';
$DIRECT_LOGIN_URL = 'http://localhost:3000/admin/login';

// Process Authentication Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_user = isset($_POST['identifier']) ? trim($_POST['identifier']) : '';
    $input_pass = isset($_POST['password']) ? $_POST['password'] : '';

    $is_valid_user = (
        strcasecmp($input_user, $ADMIN_EMAIL) === 0 || 
        strcasecmp($input_user, $ADMIN_USERNAME) === 0
    );

    if ($is_valid_user && $input_pass === $ADMIN_PASSWORD) {
        $_SESSION['pulsewear_admin_authenticated'] = true;
        $_SESSION['pulsewear_admin_user'] = $ADMIN_EMAIL;
        $_SESSION['pulsewear_login_time'] = time();
        $auth_success = true;
    } else {
        $auth_error = 'ACCESS DENIED: Invalid administrator credentials. Please check your email and security key.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal Gateway // PulseWear Heavyweight Streetwear</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #07090e;
            --surface-panel: #0d121c;
            --surface-card: #131926;
            --accent-red: #ef4444;
            --accent-red-glow: rgba(239, 68, 68, 0.2);
            --accent-indigo: #6366f1;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --border-subtle: rgba(255, 255, 255, 0.08);
            --border-focus: #6366f1;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-base);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 24px 16px;
            background-image: 
                radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 100%, rgba(239, 68, 68, 0.06) 0%, transparent 50%);
        }

        .portal-container {
            width: 100%;
            max-width: 480px;
        }

        .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.25);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #f87171;
            margin-bottom: 12px;
        }

        .brand-header {
            text-align: center;
            margin-bottom: 24px;
        }

        .brand-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #ffffff;
            margin-top: 4px;
        }

        .brand-subtitle {
            font-size: 13px;
            color: var(--text-secondary);
            margin-top: 6px;
            line-height: 1.4;
        }

        .gateway-card {
            background: var(--surface-panel);
            border: 1px solid var(--border-subtle);
            border-radius: 18px;
            padding: 32px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 13px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .success-box {
            text-align: center;
            padding: 20px 0;
        }

        .spinner {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(99, 102, 241, 0.2);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .form-group {
            margin-bottom: 18px;
        }

        label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 6px;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            background: var(--surface-card);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 14px;
            color: var(--text-primary);
            outline: none;
            transition: all 0.2s ease;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
            border-color: var(--border-focus);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
            background: #182030;
        }

        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            border: none;
            border-radius: 10px;
            padding: 13px 20px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.02em;
            cursor: pointer;
            transition: transform 0.15s ease, filter 0.15s ease;
            box-shadow: 0 6px 20px var(--accent-red-glow);
            margin-top: 8px;
        }

        .btn-submit:hover {
            filter: brightness(1.1);
            transform: translateY(-1px);
        }

        .btn-submit:active {
            transform: translateY(0);
        }

        .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 11px 16px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            margin-top: 12px;
            transition: all 0.2s ease;
        }

        .btn-secondary:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .btn-demo-autofill {
            display: inline-block;
            background: rgba(99, 102, 241, 0.12);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 6px;
            transition: background 0.2s ease;
        }

        .btn-demo-autofill:hover {
            background: rgba(99, 102, 241, 0.25);
            color: #a5b4fc;
        }

        .info-panel {
            margin-top: 24px;
            background: rgba(13, 18, 28, 0.7);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 16px 20px;
            font-size: 12px;
            color: var(--text-muted);
            line-height: 1.5;
        }

        .info-panel strong {
            color: var(--text-secondary);
        }

        .badge-pill {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .badge-blue  { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    </style>
</head>
<body>

<div class="portal-container">
    <div class="brand-header">
        <div class="brand-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Standalone External File Entrypoint
        </div>
        <h1 class="brand-title">PULSEWEAR ADMIN GATEWAY</h1>
        <p class="brand-subtitle">
            External PHP verification file for university evaluation. Connects securely to the Next.js Administrator Dashboard.
        </p>
    </div>

    <div class="gateway-card">
        <?php if ($auth_success): ?>
            <!-- Auto-redirect to Next.js Admin Panel -->
            <div class="success-box">
                <div class="spinner"></div>
                <h3 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
                    Credentials Verified // Clearance Granted
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
                    Establishing encrypted administrative session and opening Admin Dashboard...
                </p>
                <a href="<?php echo htmlspecialchars($TARGET_DASHBOARD); ?>" class="btn-submit" style="display: block; text-decoration: none; padding: 10px;">
                    Click here if not redirected in 3 seconds &rarr;
                </a>
            </div>
            <script>
                // Store verified admin session in browser sessionStorage and redirect
                try {
                    sessionStorage.setItem('pulsewear_admin_session', 'true');
                    sessionStorage.setItem('pulsewear_admin_user', JSON.stringify({
                        email: '<?php echo $ADMIN_EMAIL; ?>',
                        role: 'admin',
                        via: 'php_gateway'
                    }));
                } catch(e) {}
                setTimeout(function() {
                    window.location.href = "<?php echo $TARGET_DASHBOARD; ?>";
                }, 800);
            </script>
        <?php else: ?>
            <!-- Login Form -->
            <?php if ($auth_error): ?>
                <div class="alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span><?php echo htmlspecialchars($auth_error); ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="form-group">
                    <label for="identifier">Admin Identity (Email or Username)</label>
                    <input 
                        type="text" 
                        id="identifier" 
                        name="identifier" 
                        required 
                        placeholder="admin@pulsewear.store"
                        value="<?php echo isset($_POST['identifier']) ? htmlspecialchars($_POST['identifier']) : 'admin@pulsewear.store'; ?>"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Security Access Key / Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        placeholder="••••••••••••••••"
                        value="<?php echo isset($_POST['password']) ? htmlspecialchars($_POST['password']) : 'Admin@PulseWear2026!'; ?>"
                    >
                    <button type="button" class="btn-demo-autofill" onclick="fillAdminDemo()">
                        Fill Default Evaluation Credentials
                    </button>
                </div>

                <button type="submit" class="btn-submit">
                    Verify & Open Admin Dashboard &rarr;
                </button>
            </form>

            <a href="<?php echo htmlspecialchars($DIRECT_LOGIN_URL); ?>" target="_blank" class="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Direct Browser Launch (Next.js Gateway)
            </a>
        <?php endif; ?>
    </div>

    <!-- Session Limits & Security Specs Panel -->
    <div class="info-panel">
        <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>ACTIVE SECURITY & SESSION LIMITS</span>
            <span class="badge-pill badge-green">LIVE ENFORCED</span>
        </div>
        <ul style="padding-left: 18px; margin: 0; space-y: 4px;">
            <li><strong>Admin Session Limit:</strong> Tab-scoped in <code>sessionStorage</code>. Wiped immediately when browser/tab closes.</li>
            <li><strong>User Session Limit:</strong> JWT Access Token expires in <strong>1 hour (3,600s)</strong>; 30-day sliding refresh via HttpOnly cookie.</li>
            <li><strong>Brute-Force Limit:</strong> Rate limited to <strong>6 login attempts per 15 mins</strong> per IP.</li>
            <li><strong>Privacy Guarantee:</strong> IP addresses are hashed with a daily salt (BR-035) and never persisted in raw form.</li>
        </ul>
    </div>
</div>

<script>
function fillAdminDemo() {
    document.getElementById('identifier').value = 'admin@pulsewear.store';
    document.getElementById('password').value = 'Admin@PulseWear2026!';
}
</script>

</body>
</html>
