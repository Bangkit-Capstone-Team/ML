<?php

// Membaca isi file JSON
$jsonFilePath = 'data.json';
$jsonString = file_get_contents($jsonFilePath);

// Mengirim data JSON sebagai respons
header('Content-Type: application/json');
echo $jsonString;
?>