# esn-interview
# API
## Interview
### Get interview info
```
GET /interview/:id
access: *
```
### Interviews list
```
access: user
GET /interview
query params:
	[count = 5]: int
```
### Accept event
```
GET /interview/:id/accept
access: user
```
### Reject event
```
GET /interview/:id/reject
access: user
```
