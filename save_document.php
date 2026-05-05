<?php
// Production Security: Restrict allowed origins
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if it's a file upload (FormData) or JSON
    $filename = $_POST['filename'] ?? null;
    $folder = $_POST['folder'] ?? 'exports';
    $fileData = null;

    if (isset($_FILES['file'])) {
        // Handle direct file upload
        $fileData = file_get_contents($_FILES['file']['tmp_name']);
        if (!$filename) {
            $filename = $_FILES['file']['name'];
        }
    } elseif (isset($_POST['content'])) {
        // Handle base64 content
        $content = $_POST['content'];
        if (strpos($content, ',') !== false) {
            $content = explode(',', $content)[1];
        }
        $fileData = base64_decode($content);
    }

    if ($filename && $fileData) {
        // Sanitize filename and folder
        $filename = basename($filename);
        // Only allow saving within an 'invoices', 'exports', or 'logos' base directory for security
        $folder = preg_replace('/[^a-zA-Z0-9\/_-]/', '', $folder);
        if (!preg_match('/^(invoices|exports|logos)/', $folder)) {
            $folder = 'exports/' . $folder;
        }
        
        // Ensure folder exists
        $targetDir = __DIR__ . DIRECTORY_SEPARATOR . $folder;
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true); // Use 0755 for better security in production
        }

        $filepath = $targetDir . DIRECTORY_SEPARATOR . $filename;

        // Prevent overwriting sensitive system files
        if (file_exists($filepath) && !is_writable($filepath)) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "File exists and is not writable"]);
            exit;
        }

        if (file_put_contents($filepath, $fileData)) {
            error_log("Successfully saved $filename to $filepath");
            echo json_encode([
                "status" => "success", 
                "message" => "File saved successfully",
                "path" => $folder . '/' . $filename
            ]);
        } else {
            error_log("Failed to write $filename to $filepath");
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to write file to disk. Check permissions on " . $folder]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing filename or file content"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>
