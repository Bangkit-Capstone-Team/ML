<?php
include_once 'db_connect.php';

// Ambil koordinat pemilihan dari POST data
$coords = $_POST['coords'];
$imagePath = $_POST['imagePath'];
$productId = $_POST['idProduct'];


// Generate nama file baru dengan timestamp
$newImageName = time() . '_' . basename($imagePath);
$newImagePath = "./data/images/$newImageName";

// Mulai transaksi
mysqli_begin_transaction($conn);

try {

    // Lakukan operasi update kolom image pada tabel product
    $updateQuery = "UPDATE product SET image = '$newImageName' WHERE id_product = '$productId'";
    $result = mysqli_query($conn, $updateQuery);

    if (!$result) {
        // Jika query update gagal, lempar exception
        throw new Exception("Error updating product image");
    }

    /// Lakukan operasi crop dan simpan gambar baru
    $source = imagecreatefromjpeg($imagePath);
    $croppedImage = imagecreatetruecolor($coords['w'], $coords['h']);
    imagecopy($croppedImage, $source, 0, 0, $coords['x'], $coords['y'], $coords['w'], $coords['h']);
    imagejpeg($croppedImage, $newImagePath);
    imagedestroy($source);
    imagedestroy($croppedImage);

    // Hapus file asli setelah commit transaksi
    unlink($imagePath);

    // Commit transaksi jika semua operasi berhasil
    mysqli_commit($conn);


    // Kirim respons ke client
    echo 'Image cropped, saved, and database updated successfully';
} catch (\Throwable $th) {
    throw $th;
}
?>
