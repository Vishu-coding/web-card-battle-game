<?php
session_start();
include 'db.php';

$username = $_POST['username'];
$password = $_POST['password'];

$check = $conn->prepare("SELECT id FROM users WHERE username=?");
$check->bind_param("s", $username);
$check->execute();

$result = $check->get_result(); 
if ($result->num_rows > 0) {
    echo "<script>alert('Username already taken'); window.location.href='login.html';</script>";
    $check->close();
    exit();
}

$check->close(); 
$hashed = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $hashed);

if ($stmt->execute()) {
    echo "<script>alert('Account created! You can now login.'); window.location.href='login.html';</script>";
} else {
    echo "<script>alert('Registration failed. Try again.'); window.location.href='login.html';</script>";
}
$stmt->close();
?>

