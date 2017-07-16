# akademia17-employee-helper

Domain: https://akademia17-employee-helper.herokuapp.com/api/v1

##Actions:
###Unauthenticated:
	1. Register:
		- endpoint: /auth/register
		- method: POST
		- params: username, password
	2. Login:
		- endpoint: /auth/register
		- method: POST
		- params: username, password
###Authenticated:
	1. Generate new employee id
		- endpoint: /employee/:id
		- method: GET
	2. Generate new verification pin:
		- endpoint: /code
		- method: GET

##Authentication:
	1. Header: Authorization: Bearer <token>
	2. Request body: token: <token>
	3. Query string: <domain>/<endpoint>?token=<token>