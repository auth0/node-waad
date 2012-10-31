Query Windows Azure Active Directory graph

```
npm install node-waad
```

## General usage

Get an access token and query the graph

```js
waadAuth.auth('tenantid', 'spn-appprincipal', 'symmetric-key-base64', function(err, token) {
	// query the graph
	waad.getUserByEmail(token, 'matias@auth10dev.onmicrosoft.com', function(err, user) {
		// get user properties (user.DisplayName, user.Mail, etc.)
	});
});
```

## Coverage

This is the bare minimum I needed for my purpose. 

Get user information by email

```js
getUserByEmail(token, 'matias@auth10dev.onmicrosoft.com', ...)
```

Get groups user belong to by email

```js
getGroupsForUserByEmail(token, 'matias@auth10dev.onmicrosoft.com', ...)
```

## How to Get TenantId, SymmetricKey and AppPrincipalId

### Creating the symmetric key and app principal id

```powershell
Import-Module MSOnline
Import-Module MSOnlineExtended

Connect-MsolService 

$symmetricKey = "FStnXT1QON84B............5onYtzJ91Gg/JH/Jxiw" // generate one
$appPrincipalId = "2829c758-2bef-....-a685-717089474509"

$sp = New-MsolServicePrincipal -ServicePrincipalNames @("yourappname/some.host.com") -AppPrincipalId $appPrincipalId -DisplayName "yourappname" -Type Symmetric -Value $symmetricKey -Usage Verify -StartDate "1/1/2012" -EndDate "11/11/2014" 

# assign permissions to that principal to query the graph (Service Support Administrator == read, Company Administrator == readwrite)
Add-MsolRoleMember -RoleMemberType ServicePrincipal -RoleName "Service Support Administrator" -RoleMemberObjectId $sp.ObjectId
```

### Getting your tenantId

```powershell
(get-msolcompanyinformation).objectId
```
## License

MIT - auth10