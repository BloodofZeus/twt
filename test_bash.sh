#!/bin/bash
echo "Testing local file write via PHP..."
C:/xampp/php/php.exe -r "file_put_contents('c:/xampp/htdocs/invoices/bash_test.txt', 'Bash test at ' . date('Y-m-d H:i:s'));"
if [ -f "c:/xampp/htdocs/invoices/bash_test.txt" ]; then
    echo "SUCCESS: File exists at c:/xampp/htdocs/invoices/bash_test.txt"
    cat "c:/xampp/htdocs/invoices/bash_test.txt"
else
    echo "ERROR: File was not created."
fi
