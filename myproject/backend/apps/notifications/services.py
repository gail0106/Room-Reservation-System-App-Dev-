from .models import Notification

print("SERVICES MODULE LOADED")
def create_notification(user, title, message):

    print("NOTIFICATION FUNCTION CALLED")  # ADD THIS

    Notification.objects.create(
        user=user,
        title=title,
        message=message
    )