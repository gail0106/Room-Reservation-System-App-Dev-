# ROOM RESERVATION API

Base URL:
http://127.0.0.1:8000/api/

1. Register
    POST /auth/register/

    body: 
    {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "student"
    }

2. Login
    POST /auth/login/

    body:
    {
        "username": "username"
        "password": "password"
    }

    response:
    {
        "access": "jwt_token",
        "refresh": "jwt_token"
    }

3. ROOMS API
    a. Create Resrvation
        POST /reservations/

        body: 
        {
            "room": 1,
            "start_time": "2026-05-20T08:00:00Z",
            "end_time": "2026-05-20T10:00:00Z"
        }

    b. Get MY Reservations
        GET /reservations/

    c. Approve Reservation (Admin Only)
        PATCH /reservations/:id/approve/

        body:
        {
            "status": "approved"
        }

    d. Cancel Reservation
        DELETE /reservations/:id/cancel/

4. AVAILABILITY API
    PATCH /reservations/:id/cancel/
        Query Params:
        start_time
        end_time

    PATH /reservations/:id/approve/



# RULES
- All requests require JWT token
- Only admin can create rooms
- Only admin can approve reservations
- Users can only view their own reservations
- Conflicting reservations are blocked automatically