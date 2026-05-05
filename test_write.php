<?php
$test_folder = 'invoices/test_folder';
if (!file_exists($test_folder)) {
    mkdir($test_folder, 0755, true);
}
$test_file = $test_folder . '/test.txt';
$result = file_put_contents($test_file, 'Testing file write at ' . date('Y-m-d H:i:s'));

if ($result !== false) {
    echo "SUCCESS: File written to $test_file\n";
} else {
    echo "ERROR: Failed to write file to $test_file\n";
    $error = error_get_last();
    echo "Reason: " . $error['message'] . "\n";
}
?>
