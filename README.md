Query Windows Azure Active Directory graph

```
npm install node-waad
```

## General usage

Get an access token and query the graph

### Using a service principal created with PowerShell

```js
var Waad = require('node-waad');
var waad = new Waad(); // this can take fiddler:true if you want to proxy through fiddler

waad.auth.getAccessToken('auth10dev.onmicrosoft.com', 'spn-appprincipal', 'symmetric-key-base64', function(err, token) {
    // query the graph
    waad.graph.getUserByEmail(token, 'auth10dev.onmicrosoft.com', 'matias@auth10dev.onmicrosoft.com', function(err, user) {
        // get user properties (user.DisplayName, user.Mail, etc.)
    });
});
```

### Using client_id and secret from sellerdashboard

```js
var Waad = require('node-waad');
var waad = new Waad(); // this can take fiddler:true if you want to proxy through fiddler

waad.auth.getAccessToken('auth10dev.onmicrosoft.com', 'myapp.com', 'client-id', 'client-secret', function(err, token) {
    // query the graph
    waad.graph.getUserByEmail(token, 'auth10dev.onmicrosoft.com', 'matias@auth10dev.onmicrosoft.com', function(err, user) {
        // get user properties (user.DisplayName, user.Mail, etc.)
    });
});
```

## Graph methods

### getUsers(accessToken, tenant, [includeGroups], callback)

Fetch a list of all users. Parameters:

-   **accessToken** a valid access token that you can obtain with the two afore mentioned methods.
-   **tenant** the id of the tenant. 
-   **includeGroups** optional (default ```false```) when set to true it will fetch the groups for each user and load them in the ```user.groups``` property. **Warning** when includeGroups is true an additional request will be made for every user.
-   **callback** is a function with two arguments ```err``` and ```users```.


### getUserByEmail(accessToken, tenant, email, [includeGroups], callback)

Fetch one user by its email address. Parameters:

-   **accessToken** a valid access token that you can obtain with the two afore mentioned methods.
-   **tenant** the id of the tenant.
-   **email** the email address of the requested user. 
-   **includeGroups** optional (default ```false```) when set to true it will fetch the groups for the user and load them in the ```user.groups``` property.
-   **callback** is a function with two arguments ```err``` and ```user```. It will always return 1 user or null.


### getGroupsForUserByEmail(accessToken, tenant, email, callback)

Fetch the list of groups the user belongs to. Parameters:

-   **accessToken** a valid access token that you can obtain with the two afore mentioned methods.
-   **tenant** the id of the tenant.
-   **email** the email address of the requested user. 
-   **callback** is a function with two arguments ```err``` and ```groups```.


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

## How to Get a client ID and client secret

Go to <http://sellerdashboard.microsoft.com>

Register as a company or individual
Click on "add a new oauth client id"

To give permissions to this client to query the graph of a tenant you can use the following URL to the tenant to give consent
https://activedirectory.windowsazure.com/Consent/AuthorizeApplication.aspx?ApplicationId=<your-client-id>&RequestedPermissions=DirectoryReader

## License

MIT - auth10