<?php

// Include database connection file
include_once 'db_connect.php';

// Prepare SQL query
$sql = "SELECT * FROM product";

// Execute query and store result in $result variable
$result = $conn->query($sql);

// Check if there are results
if ($result->num_rows > 0) {
    // Create an empty array to store data
    $data = [];

    // Loop through each row of data
    while ($row = $result->fetch_assoc()) {
        // Add row data to the $data array
        $data[] = $row;
    }

    // Encode data to JSON format
    $json_data = json_encode($data);

    // Send JSON data to the browser
    echo $json_data;
} else {
    echo "No data found";
}

// Close database connection
$conn->close();
?>
