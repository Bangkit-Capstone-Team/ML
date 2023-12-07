<?php

// Include database connection file
include_once 'db_connect.php';

// Validasi input
if (empty($_POST['id_product'])) {
  die('Parameter id_product tidak boleh kosong');
}

// Hapus data dari database
$sql = "DELETE FROM product WHERE id_product = {$_POST['id_product']}";
$result = mysqli_query($conn, $sql);

// Cek hasil query
if ($result) {
  // Berhasil
  echo 'Data berhasil dihapus';
} else {
  // Gagal
  echo 'Data gagal dihapus';
}

// Tutup koneksi ke database
mysqli_close($conn);

?>
