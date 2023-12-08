<?php

// Database connection settings
$servername = "localhost";
$username = "edoc";
$password = "edoc123";
$database = "dataset";

// Create database connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set encoding
$conn->set_charset("utf8");

// Return connection object
return $conn;

?>
