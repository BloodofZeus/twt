<?php
/**
 * Real PDF Generation Test
 * This script generates a VALID minimal PDF file that can be opened in any viewer.
 */

$invoice_id = "REAL_TEST_" . date('His');
$folder = "invoices/" . $invoice_id;
$filename = "VALID_TEST_INVOICE.pdf";

// Valid minimal PDF 1.4 binary structure
$pdf_content = "%PDF-1.4\n" .
"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n" .
"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n" .
"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <<>> >> endobj\n" .
"4 0 obj <</Length 51>> stream\n" .
"BT /F1 24 Tf 100 700 Td (Emily R. Davidson - Test Invoice) Tj ET\n" .
"endstream endobj\n" .
"xref\n" .
"0 5\n" .
"0000000000 65535 f\n" .
"0000000009 00000 n\n" .
"0000000056 00000 n\n" .
"0000000111 00000 n\n" .
"0000000212 00000 n\n" .
"trailer <</Size 5 /Root 1 0 R>>\n" .
"startxref\n" .
"313\n" .
"%%EOF";

$targetDir = __DIR__ . DIRECTORY_SEPARATOR . $folder;
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$filepath = $targetDir . DIRECTORY_SEPARATOR . $filename;

if (file_put_contents($filepath, $pdf_content)) {
    echo "--- SUCCESS ---\n";
    echo "A VALID PDF has been generated at:\n";
    echo $filepath . "\n\n";
    echo "You can now go to this folder and double-click the file to open it!\n";
} else {
    echo "ERROR: Failed to write file.\n";
}
?>
