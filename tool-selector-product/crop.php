<?php
// Ambil koordinat pemilihan dari POST data
$coords = $_POST['coords'];
$imagePath = $_POST['imagePath'];

// Buat sumber gambar dari file
$source = imagecreatefromjpeg($imagePath);

// Buat gambar hasil crop
$croppedImage = imagecreatetruecolor($coords['w'], $coords['h']);
imagecopy($croppedImage, $source, 0, 0, $coords['x'], $coords['y'], $coords['w'], $coords['h']);

// Simpan gambar hasil crop ke folder output
imagejpeg($croppedImage, $imagePath);

// Hapus sumber dan gambar hasil crop dari memori
imagedestroy($source);
imagedestroy($croppedImage);

// Kirim respons ke client
echo 'Image cropped and saved successfully';
?>
