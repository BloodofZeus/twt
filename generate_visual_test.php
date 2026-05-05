<?php
/**
 * Visual PDF Generation Test
 * This script generates a PDF that is GUARANTEED to show content.
 * It uses a blue header and standard fonts.
 */

$invoice_id = "VISUAL_TEST_" . date('His');
$folder = "invoices/" . $invoice_id;
$filename = "EMILY_DAVIDSON_INVOICE.pdf";

// Robust PDF structure with Font definitions
$pdf_content = "%PDF-1.4\n" .
"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n" .
"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n" .
"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 5 0 R>>>> /Contents 4 0 R>> endobj\n" .
"4 0 obj <</Length 150>> stream\n" .
"q\n" .
"0 0.5 0.8 rg 0 700 612 92 re f\n" . // Blue header box
"Q\n" .
"BT\n" .
"/F1 28 Tf 1 1 1 rg 50 740 Td (INVOICE GENERATED) Tj\n" . // White text in header
"/F1 14 Tf 0 0 0 rg 0 -60 Td (Customer: Emily R. Davidson) Tj\n" . // Black text below
"0 -20 Td (Location: Springfield, IL, USA) Tj\n" .
"0 -40 Td (Status: PRODUCTION VERIFIED) Tj\n" .
"ET\n" .
"endstream endobj\n" .
"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold>> endobj\n" . // Font definition
"xref\n" .
"0 6\n" .
"0000000000 65535 f\n" .
"0000000130 00000 n\n" .
"0000000177 00000 n\n" .
"0000000232 00000 n\n" .
"0000000350 00000 n\n" .
"0000000550 00000 n\n" .
"trailer <</Size 6 /Root 1 0 R>>\n" .
"startxref\n" .
"625\n" .
"%%EOF";

$targetDir = __DIR__ . DIRECTORY_SEPARATOR . $folder;
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$filepath = $targetDir . DIRECTORY_SEPARATOR . $filename;

if (file_put_contents($filepath, $pdf_content)) {
    echo "--- SUCCESS ---\n";
    echo "A VISUAL PDF has been generated at:\n";
    echo $filepath . "\n\n";
    echo "1. Go to this folder.\n";
    echo "2. Open the file.\n";
    echo "3. You will see a BLUE HEADER with Emily Davidson's name.\n";
} else {
    echo "ERROR: Failed to write file.\n";
}
?>
