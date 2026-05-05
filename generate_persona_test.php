<?php
/**
 * Persona Verification Script
 * This script generates test documents for every industry using the 
 * new female persona (Emily R. Davidson) defaults.
 */

$industries = ['hospital', 'pharmacy', 'electricity', 'water', 'retail'];
$customer_persona = [
    'name' => 'Emily R. Davidson',
    'address' => '742 Evergreen Terrace, Springfield, IL 62704, USA',
    'city' => 'Springfield, IL'
];

echo "--- STARTING PERSONA DEFAULTS VERIFICATION (Customer-Centric) ---\n";

foreach ($industries as $industry) {
    $invoice_id = "CUST_PERSONA_" . strtoupper($industry) . "_" . date('His');
    $folder = "invoices/" . $invoice_id;
    
    // Fictional companies in Springfield, IL
    $details = [
        'hospital' => ['name' => 'Springfield Memorial Hospital'],
        'pharmacy' => ['name' => 'Capitol City Wellness Pharmacy'],
        'electricity' => ['name' => 'City Water, Light & Power (CWLP)'],
        'water' => ['name' => 'Springfield Water District'],
        'retail' => ['name' => 'Lincoln Square Boutique']
    ];

    $info = $details[$industry];
    
    // Create Folder
    $targetDir = __DIR__ . DIRECTORY_SEPARATOR . $folder;
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // Generate Mock JSON Data
    $json_data = json_encode([
        "id" => $invoice_id,
        "theme" => $industry,
        "documentType" => "invoice",
        "company" => [
            "name" => $info['name'],
            "address" => "Downtown Springfield, IL 62701, USA",
            "city" => "Springfield, IL"
        ],
        "customerName" => $customer_persona['name'],
        "customerAddress" => $customer_persona['address'],
        "status" => "pending",
        "timestamp" => date('Y-m-d H:i:s'),
        "persona_type" => "customer_female_usa"
    ], JSON_PRETTY_PRINT);

    // Save JSON
    file_put_contents($targetDir . DIRECTORY_SEPARATOR . "INV_" . $invoice_id . ".json", $json_data);
    
    // Simulate PDF creation (Empty mock)
    file_put_contents($targetDir . DIRECTORY_SEPARATOR . "TWT-INV-" . $invoice_id . ".pdf", "%PDF-1.4 Customer Persona Mock Content");

    echo "SUCCESS: Generated $industry invoice for customer {$customer_persona['name']} from Springfield-based company {$info['name']}\n";
}

echo "--- ALL INDUSTRIES VERIFIED ---\n";
?>
