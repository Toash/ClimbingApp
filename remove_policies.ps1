# Array of Lambda function names
# $LAMBDA_FUNCTIONS = @("myfunction", "backend-staging")
#$LAMBDA_FUNCTIONS = @("backend-staging")
$LAMBDA_FUNCTIONS = @("myfunction")

# Function to remove all permissions from a Lambda function
function Remove-AllPermissions {
    param (
        [string]$FunctionName
    )
    Write-Host "Attempting to remove all permissions for function: $FunctionName..."
    
    # Fetch the policy for the function
    $Policy = aws lambda get-policy --function-name $FunctionName | ConvertFrom-Json
    
    if ($Policy -ne $null -and $Policy.Policy -ne $null) {
        # Parse the statements in the policy
        $PolicyStatements = ($Policy.Policy | ConvertFrom-Json).Statement
        
        foreach ($Statement in $PolicyStatements) {
            $Sid = $Statement.Sid
            # Remove the permission by statement ID
            aws lambda remove-permission --function-name $FunctionName --statement-id $Sid
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Removed permission with SID: $Sid for function: $FunctionName"
            } else {
                Write-Host "Failed to remove permission with SID: $Sid for function: $FunctionName"
            }
        }
    } else {
        Write-Host "No existing policy found for function: $FunctionName. Skipping."
    }
}

# Loop through each Lambda function and remove all permissions
foreach ($Function in $LAMBDA_FUNCTIONS) {
    Remove-AllPermissions -FunctionName $Function
}
