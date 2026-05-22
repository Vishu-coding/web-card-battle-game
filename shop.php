<<?php
session_start();
if(!isset($_SESSION['user'])) {
    header("Location: login.html");
    exit();
}
include 'db.php';

$user_query = $conn->prepare("SELECT id FROM users WHERE username = ?");
$user_query->bind_param("s", $_SESSION['user']);
$user_query->execute();
$user = $user_query->get_result()->fetch_assoc();
$user_id = $user['id'] ?? 0;

$inventory = $conn->query("SELECT char_id FROM user_inventory WHERE user_id = $user_id")->fetch_all(MYSQLI_ASSOC);
$owned = array_column($inventory, 'char_id');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop — <?php echo htmlspecialchars($_SESSION['user']); ?> | Nexus Anima</title>
    <style>/* original shop styles */</style>
</head>
<body>
    <div class="header-bar">
        <h1>UNIT_DATABASE</h1>
        <div class="currency-container">
            CORE_GEMS: <span id="gem-balance"><?php echo $balance ?? 0; ?></span>
            <a href="purchase.php">[ + ] PURCHASE</a>
        </div>
    </div>
    
    <div id="shop-grid" class="shop-container">
        <?php foreach (CHARACTERS as $char): $is_owned = in_array($char['id'], $owned); ?>
        <div class="card">
            <img src="<?php echo $char['img']; ?>">
            <h3><?php echo $char['name']; ?></h3>
            <div>HP: <?php echo $char['hp']; ?> ATK: <?php echo $char['atk']; ?> SPD: <?php echo $char['spd']; ?></div>
            <div>COST: <?php echo $char['price'] ?? 500; ?> GEMS</div>
            <button onclick="buyCharacter(<?php echo $char['id']; ?>)">
                <?php echo $is_owned ? 'OWNED' : 'RECRUIT'; ?>
            </button>
        </div>
        <?php endforeach; ?>
    </div>

    <script>
        let userId = <?php echo $user_id; ?>;
        function buyCharacter(id) {
            // AJAX to api/buy_character.php
        }
    </script>
</body>
</html>
