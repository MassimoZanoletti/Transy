
rmdir /S /Q  dist
call ng build -c production
echo "------------------>>> Copia .htaccess"
copy src\.htaccess dist\transy\browser
copy scripts\avvia.bat dist\transy\browser

echo "FINE!"
