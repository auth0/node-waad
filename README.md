Query Windows Azure Active Directory graph

```
npm install node-waad
```

![](https://nodei.co/npm-dl/node-waad.png)

## General usage

> UPDATE: we updated the package to use the api-version 1.0. We implemented a couple of methods only. The version 0.5 has more things implemented (like paging).


Get an access token and query the graph

Alternatively you can call ```waad.getGraphClient``` in one function

~~~javascript
var waad = require('node-waad');

waad.getGraphClient10('auth10dev.onmicrosoft.com', 'client-id', 'client-secret', function(err, client) {
  // query the graph
  client.getUserByMail('matias@auth10dev.onmicrosoft.com', function(err, user) {
    // get user properties (user.displayName, user.mail, etc.)
  });
});
~~~

## Graph methods (API v1.0)

### getUsers([options], callback)

Fetch a list of all users. 

**Callback** is a function with two arguments ```err``` and ```users```. Users is an array of user objects (paging not implemented, use v0.5)

### getUserByEmail(email, callback)

Fetch one user by its email address. Parameters:

-   **email** the email address of the requested user. 
-   **callback** is a function with two arguments ```err``` and ```user```. It will always return 1 user or null.

### getUserByProperty(propertyName, propertyValue, callback)

Fetch one user by the specified property. Parameters:

-   **propertyName** the name of the property. 
-   **propertyValue** the value of the property (match is exact). 
-   **callback** is a function with two arguments ```err``` and ```user```. It will always return 1 user or null.

### getGroupsForUserByObjectIdOrUpn(objectIdOrUpn, callback)

Fetch the list of groups the user belongs to. Parameters:

-   **objectIdOrUpn** the `objectId` or `userPrincipalName` of the user. 
-   **callback** is a function with two arguments ```err``` and ```groups```.


## How to Get a client ID and client secret

Read this tutorial from Microsoft 
[Adding, Updating, and Removing an App](http://msdn.microsoft.com/en-us/library/windowsazure/dn132599.aspx)

### API version 0.5

Get an access token and query the graph

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

## Graph methods (API v0.5)

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

## License

MIT - Auth0
