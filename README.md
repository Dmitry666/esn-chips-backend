# esn-chips
# API
## Chips
### Get chips info
```
GET /chips/:id
access: *
```
### Chips list
```
access: user
GET /chips
query params:
	[count = 5]: int
```
### Crack chip
```
GET /chips/:id/crack
access: user
```
### Ignore chip
```
GET /chips/:id/ignore
access: user
```
