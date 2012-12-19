Query Windows Azure Active Directory graph

```
npm install node-waad
```

## General usage

Get an access token and query the graph

### Using a service principal created with PowerShell

```js
var waad = require('node-waad');

waad.getAccessToken('auth10dev.onmicrosoft.com', 'spn-appprincipal', 'symmetric-key-base64', function(err, token) {
  // this can take fiddler:true if you want to proxy through fiddler
  var client = new waad.GraphClient({tenant: 'auth10dev.onmicrosoft.com', accessToken: token}); 

  // query the graph
  client.getUserByEmail('matias@auth10dev.onmicrosoft.com', function(err, user) {
    // get user properties (user.DisplayName, user.Mail, etc.)
  });
});
```

Alternatively you can call ```waad.getGraphClient``` in one function

~~~javascript
var waad = require('node-waad');

waad.getGraphClient('auth10dev.onmicrosoft.com', 'spn-appprincipal', 'symmetric-key-base64', function(err, client) {
  // query the graph
  client.getUserByEmail('matias@auth10dev.onmicrosoft.com', function(err, user) {
    // get user properties (user.DisplayName, user.Mail, etc.)
  });
});
~~~


### Using client_id and secret from sellerdashboard

```js
var waad = require('node-waad');

waad.getAccessTokenWithClientCredentials('auth10dev.onmicrosoft.com', 'myapp.com', 'client-id', 'client-secret', function(err, token) {
  
  // this can take fiddler:true if you want to proxy through fiddler
  var client = new waad.GraphClient({tenant: 'auth10dev.onmicrosoft.com', accessToken: token}); 

  // query the graph
  client.getUserByEmail('matias@auth10dev.onmicrosoft.com', function(err, user) {
    // get user properties (user.DisplayName, user.Mail, etc.)
  });
});
```

Or use ```getGraphClientWithClientCredentials```:

```js
var waad = require('node-waad');

waad.getGraphClientWithClientCredentials('auth10dev.onmicrosoft.com', 'myapp.com', 'client-id', 'client-secret', function(err, client) {
  // query the graph
  client.getUserByEmail('matias@auth10dev.onmicrosoft.com', function(err, user) {
    // get user properties (user.DisplayName, user.Mail, etc.)
  });
});
```

## Graph methods

### getUsers([options], callback)

Fetch a list of all users. 

**Callback** is a function with two arguments ```err``` and ```users```. Users is an array of user objects with few additional properties:

-   **hasMorePages** true if there are more users for this query
-   **skiptoken** if there is more pages for this query, you will have to use this skiptoken to get the next page.
-   **nextPage(callback)** if you want to fetch the next page inmediately, you can use this method instead of the afore mentioned skiptoken. The callback for this method works in the same way than the getUsers callback.

**Options** has the following optional properties:

-   **includeGroups** optional (default ```false```) when set to true it will fetch the groups for each user and load them in the ```user.groups``` property. **Warning** when includeGroups is true an additional request will be made for every user.
-   **skiptoken** optional when set will fetch the next page of the result set.
-   **top** the maximum amount of users we want for this query.

### getUserByEmail(email, [includeGroups], callback)

Fetch one user by its email address. Parameters:

-   **email** the email address of the requested user. 
-   **includeGroups** optional (default ```false```) when set to true it will fetch the groups for the user and load them in the ```user.groups``` property.
-   **callback** is a function with two arguments ```err``` and ```user```. It will always return 1 user or null.

### getUserByProperty(accessToken, tenant, propertyName, propertyValue, [includeGroups], callback)

Fetch one user by the specified property. Parameters:

-   **accessToken** a valid access token that you can obtain with the two afore mentioned methods.
-   **tenant** the id of the tenant.
-   **propertyName** the name of the property. 
-   **propertyValue** the value of the property (match is exact). 
-   **includeGroups** optional (default ```false```) when set to true it will fetch the groups for the user and load them in the ```user.groups``` property.
-   **callback** is a function with two arguments ```err``` and ```user```. It will always return 1 user or null.

### getGroupsForUserByEmail(email, callback)

Fetch the list of groups the user belongs to. Parameters:

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