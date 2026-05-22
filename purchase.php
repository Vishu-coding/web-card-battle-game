<<?php
session_start();
if(!isset($_SESSION['user'])) {
    header("Location: login.html");
    exit();
}
include 'db.php';

// Get user ID
$user_query = $conn->prepare("SELECT id FROM users WHERE username = ?");
$user_query->bind_param("s", $_SESSION['user']);
$user_query->execute();
$user = $user_query->get_result()->fetch_assoc();
$user_id = $user['id'] ?? 0;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase — <?php echo htmlspecialchars($_SESSION['user']); ?> | Nexus Anima</title>
    <style>/* original styles here */</style>
</head>
<body>
    <div class="status-bar">
        <span>[ SPECTRUM_ANALYSIS_ACTIVE ]</span>
        <span id="clock">00:00:00</span>
    </div>
    
    <h1 class="glitch-header">PURCHASE</h1>
    
    <div class="credit-box">
        GEMS: <span id="current-gems"><?php echo $balance ?? 0; ?></span>
    </div>

    <div class="bundle-container">
        <div class="bundle" onclick="purchaseGems(100, 0.99)">
            <div style="font-size: 0.8rem; color: var(--nexus-dim);">DATA_PK_S</div>
            <div style="font-size: 1.5rem;">100 GEMS</div>
            <p class="price">$0.99</p>
        </div>
        <!-- other bundles -->
    </div>

    <script>
        let userId = <?php echo $user_id; ?>;
        // Convert localStorage logic to AJAX/DB
        function purchaseGems(amount, price) {
            fetch('api/purchase_gems.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({amount: amount, price: price, userId: userId})
            }).then(r => r.json()).then(data => {
                if(data.success) {
                    document.getElementById('current-gems').innerText = data.newBalance;
                }
            });
        }
    </script>
</body>
</html>
