<?php

// Mengambil title dari parameter query string
$titleToDelete = $_GET['title'];

function deleteRowsByTitle($filePath, $titleToDelete) {
    try {
        // Membaca isi file JSON
        $jsonString = file_get_contents($filePath);

        // Mendekode string JSON menjadi array PHP
        $jsonData = json_decode($jsonString, true);

        // Inisialisasi array baru untuk menyimpan data yang tidak dihapus

        foreach ($jsonData['title'] as $key => $value) {
            if ($value == $titleToDelete) {
                unset($jsonData['url'][$key]);
                unset($jsonData['title'][$key]);
                unset($jsonData['imgageSrc'][$key]);
                unset($jsonData['filename'][$key]);
            }
        }

        // Menyimpan kembali array sebagai string JSON ke dalam file
        $updatedJsonString = json_encode($jsonData, JSON_PRETTY_PRINT);
        file_put_contents($filePath, $updatedJsonString);

        // Memberikan respons JSON
        $response = [
            'status' => 'success',
            'message' => "Data dengan title '$titleToDelete' berhasil dihapus."
        ];

        http_response_code(200); // Status code OK
        echo json_encode($response);
    } catch (\Throwable $th) {
        $response = [
            'status' => 'error',
            'message' => 'Terjadi kesalahan dalam penghapusan data.'
        ];

        http_response_code(500); // Status code Internal Server Error
        echo json_encode($response);
    }
}

deleteRowsByTitle('data.json', $titleToDelete);

?>