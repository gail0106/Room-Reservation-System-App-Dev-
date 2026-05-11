def api_response(success=True, message="", data=None, errors=None):

    return {
        "success": success,
        "message": message,
        "data": data,
        "errors": errors
    }