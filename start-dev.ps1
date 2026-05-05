# PowerShell script to start both dev servers
# Requires: MySQL running, backend .env configured

$backend = Start-Process -FilePath "powershell" -ArgumentList "-Command cd backend; npm run start:dev" -PassThru
$frontend = Start-Process -FilePath "powershell" -ArgumentList "-Command cd frontend; npm run dev" -PassThru

Write-Host "Backend started on PID $($backend.Id) - http://localhost:3001"
Write-Host "Frontend started on PID $($frontend.Id) - http://localhost:3000"
Write-Host "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
[void][System.Console]::ReadKey($true)

Stop-Process -Id $backend.Id -Force
Stop-Process -Id $frontend.Id -Force
Write-Host "Stopped."
