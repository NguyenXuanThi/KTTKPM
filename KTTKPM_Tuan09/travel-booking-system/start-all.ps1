# Script to start all Travel Booking System services

Write-Host "Starting Travel Booking System..." -ForegroundColor Green

$basePath = "d:\Course\KTTKPM\Tuan9\travel-booking-system"

function Start-Service($name) {
    Write-Host "Starting $name..." -ForegroundColor Cyan
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"cd $basePath\$name; npm run start`"" -WindowStyle Normal
}

Start-Service "user-service"
Start-Service "tour-service"
Start-Service "booking-service"
Start-Service "payment-service"
Start-Service "orchestrator-service"

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"cd $basePath\frontend; npm run dev`"" -WindowStyle Normal

Write-Host "All services started! Check the newly opened windows." -ForegroundColor Green
Write-Host "Frontend is running at http://localhost:5173" -ForegroundColor Yellow
Write-Host "Orchestrator Service is running at http://localhost:8080" -ForegroundColor Yellow
